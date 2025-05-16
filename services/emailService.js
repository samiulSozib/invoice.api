// const mailjet = require('node-mailjet');

// const mailjetClient = mailjet.apiConnect(
//   '5249a3d2ee3ac853f2334f5861493c28', // Replace with your actual Mailjet API key
//   '64e6492220769e052084f010c0f8be07'  // Replace with your actual Mailjet API secret
// );

// const sendEmail = async (to, subject, text) => {
//   const request = mailjetClient.post('send', { version: 'v3.1' }).request({
//     Messages: [
//       {
//         From: {
//           Email: 'admin@www.nodescript-it.com', // Replace with your Mailjet verified sender email
//           Name: '',
//         },
//         To: [
//           {
//             Email: to,
//             Name: 'Recipient Name',
//           },
//         ],
//         Subject: subject,
//         TextPart: text,
//       },
//     ],
//   });

//   try {
//     const result = await request;
//     console.log(result.body);
//   } catch (err) {
//     console.error('Error sending email:', err);
//   }
// };

// module.exports = { sendEmail };


const nodemailer = require('nodemailer');

// Create a transporter using your cPanel email account
// const transporter = nodemailer.createTransport({
//   host: 'mail.nodescript-it.com', // Replace with your cPanel mail server
//   port: 465,                    // Port for SSL
//   secure: true,                 // Use SSL
//   auth: {
//     user: 'contact@nodescript-it.com', // Replace with your cPanel email address
//     pass: '1ts1Tc_2w6^=',       // Replace with your cPanel email password
//   },
// });

// const transporter = nodemailer.createTransport({
//   host: 'smtp-relay.brevo.com',
//         port: 587,
//         secure: false,
//         auth: {
//             user: '7d4d33002@smtp-brevo.com',
//             pass: 'tbLzN8pjdFwP4m0K'
//         }
// });

const transporter = nodemailer.createTransport({
  host: 'business-card.samiulcse.cloud', // Replace with your cPanel mail server
  port: 465,                    // Port for SSL
  secure: true,                 // Use SSL
  auth: {
    user: 'card@business-card.samiulcse.cloud', // Replace with your cPanel email address
    pass: 'vB{Jab#8R!k,',       // Replace with your cPanel email password
  },
});

// Send an email
const sendEmail = async (to, subject, text) => {
  const mailOptions = {
    from: 'card@business-card.samiulcse.cloud', // Sender address
    to,                                // List of receivers
    subject,                           // Subject line
    text,                              // Plain text body
  };

  try {
    let info = await transporter.sendMail(mailOptions);
    console.log('Message sent: %s', info);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

module.exports = { sendEmail };

