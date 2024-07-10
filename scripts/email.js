import { https } from '/firebase-functions';
import { initializeApp } from 'firebase-admin';
import { createTransport } from 'nodemailer';
const cors = require('cors')({origin: true});
initializeApp();

/**
* Using Gmail to send 
*/
let transporter = createTransport({
    service: 'gmail',
    auth: {
        user: 'brennansatkoski@gmail.com',
        pass: 'xldfwzjglusklrhb'
    }
});

export const sendMail = https.onRequest((req, res) => {
    cors(req, res, () => {

        // getting dest email by query string
        const dest = req.query.dest;

        const mailOptions = {
            from: 'Brennan Satkoski <brennansatkoski@gmail.com>', // Something like: Jane Doe <janedoe@gmail.com>
            to: dest,
            subject: 'welcome', // email subject
            html: `<p style="font-size: 16px;">Welcome to workout planner!!</p>
                <br />
            ` // email content in HTML
        };

        // returning result
        return transporter.sendMail(mailOptions, (erro, info) => {
            if(erro){
                return res.send(erro.toString());
            }
            return res.send('Sended');
        });
    });    
});
