const { Op } = require("sequelize");
const db = require("../database/database");
const sequelize = db.sequelize;


// GET Transaction Logs
exports.getTransactionLogs = async (req, res) => {
  try {
    const business_owner_id = req.business_owner_id;

    const {
      invoice_id,
      client_id,
      page = 1,
      item_per_page = 20,
    } = req.query;

    // Pagination
    const limit = parseInt(item_per_page);
    const offset = (parseInt(page) - 1) * limit;

    // Build where clause
    const whereClause = { business_owner_id };

    if (invoice_id) whereClause.invoice_id = invoice_id;
    if (client_id) whereClause.client_id = client_id;

    // Fetch logs
    const { count, rows } = await db.transactionLog.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      status: true,
      message: "Transaction logs fetched successfully",
      transaction_logs: rows,
      pagination: {
        total_items: count,
        total_pages: Math.ceil(count / limit),
        current_page: parseInt(page),
        item_per_page: limit,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: "Internal Server Error",
      error: error.message,
      transaction_logs: [],
    });
  }
};

// GET Dashboard Statistics
// GET Dashboard Statistics
exports.getDashboardStats = async (req, res) => {
  try {
    const business_owner_id = req.business_owner_id;

    // Get current date for filtering
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    // Execute all queries in parallel
    const [
      businessOwnerData,
      allTimeStats,
      todayStats,
      thisMonthStats,
      monthlyStats,
      dailyStats,
      recentInvoices,
      clientDueSummary
    ] = await Promise.all([
      // Get business owner current totals
      db.businessOwner.findOne({
        where: { id: business_owner_id },
        attributes: [
          'id',
          'total_sales_amount',
          'total_unpaid_amount',
          [sequelize.literal('(SELECT COUNT(*) FROM invoices WHERE business_owner_id = ' + business_owner_id + ')'), 'total_invoices']
        ],
        raw: true
      }),

      // ALL TIME STATS
      db.invoice.findAll({
        where: {
          business_owner_id: business_owner_id,
          status: { [Op.ne]: 'deleted' }
        },
        attributes: [
          [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('total')), 0), 'total_sales'],
          [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('due')), 0), 'total_due'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'total_invoices'],
          [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.literal('CASE WHEN status = "paid" THEN total ELSE 0 END')), 0), 'paid_amount'],
          [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.literal('CASE WHEN status = "partial" THEN due ELSE 0 END')), 0), 'partial_due'],
          [sequelize.fn('COUNT', sequelize.literal('CASE WHEN status = "paid" THEN 1 END')), 'paid_invoices'],
          [sequelize.fn('COUNT', sequelize.literal('CASE WHEN status = "partial" THEN 1 END')), 'partial_invoices'],
          [sequelize.fn('COUNT', sequelize.literal('CASE WHEN status = "unpaid" THEN 1 END')), 'unpaid_invoices']
        ],
        raw: true
      }),

      // TODAY'S STATS
      db.invoice.findAll({
        where: {
          business_owner_id: business_owner_id,
          createdAt: { [Op.gte]: startOfToday },
          status: { [Op.ne]: 'deleted' }
        },
        attributes: [
          [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('total')), 0), 'total_sales'],
          [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('due')), 0), 'total_due'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'total_invoices'],
          [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.literal('CASE WHEN status = "paid" THEN total ELSE 0 END')), 0), 'paid_amount']
        ],
        raw: true
      }),

      // THIS MONTH STATS
      db.invoice.findAll({
        where: {
          business_owner_id: business_owner_id,
          createdAt: { [Op.gte]: startOfMonth },
          status: { [Op.ne]: 'deleted' }
        },
        attributes: [
          [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('total')), 0), 'total_sales'],
          [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('due')), 0), 'total_due'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'total_invoices']
        ],
        raw: true
      }),

      // MONTHLY BREAKDOWN (This Year)
      db.invoice.findAll({
        where: {
          business_owner_id: business_owner_id,
          createdAt: { [Op.gte]: startOfYear },
          status: { [Op.ne]: 'deleted' }
        },
        attributes: [
          [sequelize.fn('DATE_FORMAT', sequelize.col('createdAt'), '%Y-%m'), 'month'],
          [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('total')), 0), 'total_sales'],
          [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('due')), 0), 'total_due'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'invoice_count']
        ],
        group: [sequelize.fn('DATE_FORMAT', sequelize.col('createdAt'), '%Y-%m')],
        order: [[sequelize.fn('DATE_FORMAT', sequelize.col('createdAt'), '%Y-%m'), 'ASC']],
        raw: true
      }),

      // DAILY BREAKDOWN (Last 30 days)
      db.invoice.findAll({
        where: {
          business_owner_id: business_owner_id,
          createdAt: { [Op.gte]: sequelize.literal('DATE_SUB(NOW(), INTERVAL 30 DAY)') },
          status: { [Op.ne]: 'deleted' }
        },
        attributes: [
          [sequelize.fn('DATE', sequelize.col('createdAt')), 'date'],
          [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('total')), 0), 'total_sales'],
          [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('due')), 0), 'total_due'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'invoice_count']
        ],
        group: [sequelize.fn('DATE', sequelize.col('createdAt'))],
        order: [[sequelize.fn('DATE', sequelize.col('createdAt')), 'DESC']],
        limit: 30,
        raw: true
      }),

      // RECENT INVOICES
      db.invoice.findAll({
        where: {
          business_owner_id: business_owner_id,
          status: { [Op.ne]: 'deleted' }
        },
        include: [
          {
            model: db.client,
            attributes: ['id', 'name', 'phone_number', 'total_due']
          },
          {
            model: db.shop,
            attributes: ['id', 'name', 'address']
          }
        ],
        order: [['createdAt', 'DESC']],
        limit: 5
      }),

      // Client due summary
      db.client.findAll({
        where: {
          business_owner_id: business_owner_id,
          total_due: { [Op.gt]: 0 }
        },
        attributes: [
          [sequelize.fn('COUNT', sequelize.col('id')), 'clients_with_due'],
          [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('total_due')), 0), 'total_client_due']
        ],
        raw: true
      })
    ]);

    // Data Consistency Validation
    const allTimeTotalDue = parseFloat(allTimeStats[0]?.total_due || 0);
    const clientDueTotal = parseFloat(clientDueSummary[0]?.total_client_due || 0);
    const businessOwnerDue = parseFloat(businessOwnerData?.total_unpaid_amount || 0);

    const isConsistent = Math.abs(allTimeTotalDue - businessOwnerDue) < 0.01 && 
                         Math.abs(allTimeTotalDue - clientDueTotal) < 0.01;

    if (!isConsistent) {
      // Log inconsistency for audit - FIXED: provide client_id and invoice_id
      await db.transactionLog.create({
        business_owner_id,
        client_id: 0,        // Use 0 or null if your schema allows, or skip this log
        invoice_id: 0,       // Use 0 or null if your schema allows, or skip this log
        type: 'data_inconsistency_detected',
        total: 0,
        sub_total: 0,
        due_before: 0,
        payment_amount: 0,
        due_after: 0,
        status: 'inconsistency',
        note: `Due mismatch detected: Invoice total due: ${allTimeTotalDue}, Business owner due: ${businessOwnerDue}, Client due: ${clientDueTotal}`,
        payment_date: new Date()
      });
    }

    const response = {
      status: true,
      message: "Dashboard statistics fetched successfully",
      data_consistency: isConsistent,
      data: {
        business_owner_summary: {
          total_sales_amount: parseFloat(businessOwnerData?.total_sales_amount || 0),
          total_unpaid_amount: parseFloat(businessOwnerData?.total_unpaid_amount || 0),
          total_invoices: parseInt(businessOwnerData?.total_invoices || 0)
        },
        
        all_time: {
          total_sales: parseFloat(allTimeStats[0]?.total_sales || 0),
          total_due: allTimeTotalDue,
          total_invoices: parseInt(allTimeStats[0]?.total_invoices || 0),
          paid_amount: parseFloat(allTimeStats[0]?.paid_amount || 0),
          partial_due: parseFloat(allTimeStats[0]?.partial_due || 0),
          paid_invoices: parseInt(allTimeStats[0]?.paid_invoices || 0),
          partial_invoices: parseInt(allTimeStats[0]?.partial_invoices || 0),
          unpaid_invoices: parseInt(allTimeStats[0]?.unpaid_invoices || 0),
          clients_with_due: parseInt(clientDueSummary[0]?.clients_with_due || 0)
        },
        
        today: {
          total_sales: parseFloat(todayStats[0]?.total_sales || 0),
          total_due: parseFloat(todayStats[0]?.total_due || 0),
          total_invoices: parseInt(todayStats[0]?.total_invoices || 0),
          paid_amount: parseFloat(todayStats[0]?.paid_amount || 0),
          collection_rate: parseFloat(todayStats[0]?.total_sales || 0) > 0 
            ? ((parseFloat(todayStats[0]?.paid_amount || 0) / parseFloat(todayStats[0]?.total_sales || 0)) * 100).toFixed(2)
            : 0
        },
        
        this_month: {
          total_sales: parseFloat(thisMonthStats[0]?.total_sales || 0),
          total_due: parseFloat(thisMonthStats[0]?.total_due || 0),
          total_invoices: parseInt(thisMonthStats[0]?.total_invoices || 0),
          projected_monthly: parseFloat(thisMonthStats[0]?.total_sales || 0) * (30 / new Date().getDate())
        },
        
        monthly_breakdown: monthlyStats.map(stat => ({
          month: stat.month,
          total_sales: parseFloat(stat.total_sales || 0),
          total_due: parseFloat(stat.total_due || 0),
          invoice_count: parseInt(stat.invoice_count || 0),
          collection_rate: parseFloat(stat.total_sales || 0) > 0
            ? ((parseFloat(stat.total_sales || 0) - parseFloat(stat.total_due || 0)) / parseFloat(stat.total_sales || 0) * 100).toFixed(2)
            : 0
        })),
        
        daily_breakdown: dailyStats.map(stat => ({
          date: stat.date,
          total_sales: parseFloat(stat.total_sales || 0),
          total_due: parseFloat(stat.total_due || 0),
          invoice_count: parseInt(stat.invoice_count || 0)
        })),
        
        recent_invoices: recentInvoices.map(invoice => ({
          id: invoice.id,
          invoice_number: `INV-${invoice.id}`,
          total: invoice.total,
          due: invoice.due,
          status: invoice.status,
          client: invoice.client ? {
            id: invoice.client.id,
            name: invoice.client.name,
            phone: invoice.client.phone_number,
            total_due: invoice.client.total_due
          } : null,
          shop: invoice.shop ? {
            id: invoice.shop.id,
            name: invoice.shop.name
          } : null,
          created_at: invoice.createdAt,
          payable_date: invoice.payable_date
        }))
      }
    };

    return res.status(200).json(response);

  } catch (error) {
    console.error('Dashboard stats error:', error);
    
    return res.status(500).json({
      status: false,
      message: "Internal Server Error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      data: null
    });
  }
};