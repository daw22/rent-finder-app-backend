import nodemailer from 'nodemailer';

export const validEmail = (email) => email.toLowerCase().match(
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
);

export const getTransport = ()=> nodemailer.createTransport({
  service: "gmail",
  auth:{
    user: process.env.EMAIL_ADDRESS,
    pass: process.env.EMAIL_PASSWD
  }
});

export const getMailOptions = (email, code) => {
  let body = `
  <h2>Hey ${email}</h2>
  <p>Here's the email verification code:</p>
  <p style="font-weight: bold; font-size: 24px">${code}</p>
  <p>Please note that for added security this code becomes invalid after 45 minutes</p>
  <p>Stay Jiggy</p>`;

  return {
    body,
    subject: "Ethio Rent: Email verifivation code",
    to: email,
    html: body,
    from: process.env.EMAIL_ADDRESS,
  };
};