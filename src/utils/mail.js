import nodemailer from 'nodemailer';
import { customAlphabet } from 'nanoid';
import jwt from 'jsonwebtoken';

export const validEmail = (email) => email.toLowerCase().match(
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
);

const getTransport = ()=> nodemailer.createTransport({
  service: "gmail",
  auth:{
    user: process.env.EMAIL_ADDRESS,
    pass: process.env.EMAIL_PASSWD
  }
});

const getMailOptions = (email, code) => {
  let body = `
  <h2>Hey ${email}</h2>
  <p>Here's the email verification code:</p>
  <p style="font-weight: bold; font-size: 24px">${code}</p>
  <p>Please note that for added security this code becomes invalid after 10 minutes</p>
  <p>Stay Safe</p>`;

  return {
    body,
    subject: "Ethio Rent: Email verifivation code",
    to: email,
    html: body,
    from: process.env.EMAIL_ADDRESS,
  };
};

export const sendEmail = (email, token)=>{
  const mailRequest = getMailOptions(email, token);
  getTransport().sendMail(mailRequest);
}

// sends password reset code and magiclink
export const sendResetEmail = async (email, code, magicLink) =>{
  // create email body
  let body = `
  <h2>Ethio Rent</h2>
  <p>Here's your password reset code:</p>
  <p style="font-weight: bold; font-size: 24px">${code}</p>
  <p>Or follow this link to reset your password:</p>
  <p><a href="${magicLink}">${magicLink}</a></p>
  <p>Please note that for added security this code becomes invalid after 1 minute</p>
  <p>Stay Safe</p>`;
  const options = {
    body,
    subject: "Ethio Rent: Passowrd Reset Request",
    to: email,
    html: body,
    from: "Ethio Rent",
  };
  getTransport().sendMail(options);
}