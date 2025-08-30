const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_PORT === '465',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Send welcome email
const sendWelcomeEmail = async (email, firstName) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"Devnovate Blog Platform" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Welcome to Devnovate Blog Platform! 🎉',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">Welcome to Devnovate!</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Your journey as a blogger starts here</p>
          </div>
          
          <div style="padding: 30px; background: #f8f9fa; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Hello ${firstName}! 👋</h2>
            
            <p style="color: #555; line-height: 1.6;">
              Thank you for joining the Devnovate Blog Platform! We're excited to have you as part of our community of writers and readers.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
              <h3 style="color: #333; margin-top: 0;">What you can do now:</h3>
              <ul style="color: #555; line-height: 1.6;">
                <li>📝 Create and submit your first blog post</li>
                <li>🔍 Explore blogs from other authors</li>
                <li>💬 Engage with the community through comments</li>
                <li>❤️ Like and share your favorite content</li>
              </ul>
            </div>
            
            <p style="color: #555; line-height: 1.6;">
              Your blog submissions will be reviewed by our team to ensure quality content for all readers. We'll notify you once your posts are approved or if any changes are needed.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/dashboard" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">
                Start Writing Now
              </a>
            </div>
            
            <p style="color: #777; font-size: 14px; text-align: center; margin-top: 30px;">
              If you have any questions, feel free to reach out to our support team.
            </p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Welcome email sent to ${email}`);
  } catch (error) {
    console.error('Welcome email failed:', error);
    throw error;
  }
};

// Send blog status email
const sendBlogStatusEmail = async (email, firstName, blogTitle, status, rejectionReason = null) => {
  try {
    const transporter = createTransporter();
    
    let subject, html;
    
    if (status === 'approved') {
      subject = '🎉 Your Blog Post Has Been Approved!';
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">Blog Approved! 🎉</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Your content is now live on the platform</p>
          </div>
          
          <div style="padding: 30px; background: #f8f9fa; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Congratulations ${firstName}! 🎊</h2>
            
            <p style="color: #555; line-height: 1.6;">
              Your blog post "<strong>${blogTitle}</strong>" has been approved and is now published on the Devnovate Blog Platform!
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
              <h3 style="color: #333; margin-top: 0;">What happens next:</h3>
              <ul style="color: #555; line-height: 1.6;">
                <li>📖 Readers can now discover and read your post</li>
                <li>💬 They can leave comments and engage with your content</li>
                <li>❤️ Your post can receive likes and shares</li>
                <li>📊 Track your post's performance in your dashboard</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/dashboard" 
                 style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">
                View Your Dashboard
              </a>
            </div>
            
            <p style="color: #555; line-height: 1.6;">
              Keep writing amazing content! Your voice matters to our community.
            </p>
          </div>
        </div>
      `;
    } else if (status === 'rejected') {
      subject = '📝 Blog Post Update - Revisions Needed';
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #dc3545 0%, #fd7e14 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">Blog Post Update 📝</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Your post needs some revisions</p>
          </div>
          
          <div style="padding: 30px; background: #f8f9fa; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Hello ${firstName},</h2>
            
            <p style="color: #555; line-height: 1.6;">
              Your blog post "<strong>${blogTitle}</strong>" has been reviewed and requires some revisions before it can be published.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc3545;">
              <h3 style="color: #333; margin-top: 0;">Feedback from our team:</h3>
              <p style="color: #555; line-height: 1.6; font-style: italic;">
                "${rejectionReason}"
              </p>
            </div>
            
            <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
              <h3 style="color: #856404; margin-top: 0;">💡 Tips for revision:</h3>
              <ul style="color: #856404; line-height: 1.6;">
                <li>Review the feedback carefully</li>
                <li>Make the necessary changes</li>
                <li>Resubmit your post when ready</li>
                <li>Don't hesitate to reach out if you need clarification</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/dashboard" 
                 style="background: linear-gradient(135deg, #dc3545 0%, #fd7e14 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">
                Edit Your Post
              </a>
            </div>
            
            <p style="color: #555; line-height: 1.6;">
              We're here to help you succeed! Once you've made the revisions, your post will be reviewed again.
            </p>
          </div>
        </div>
      `;
    }
    
    const mailOptions = {
      from: `"Devnovate Blog Platform" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: subject,
      html: html
    };

    await transporter.sendMail(mailOptions);
    console.log(`Blog status email sent to ${email}`);
  } catch (error) {
    console.error('Blog status email failed:', error);
    throw error;
  }
};

// Send password reset email
const sendPasswordResetEmail = async (email, firstName, resetToken) => {
  try {
    const transporter = createTransporter();
    
    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: `"Devnovate Blog Platform" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '🔐 Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #6f42c1 0%, #e83e8c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">Password Reset 🔐</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Secure your account</p>
          </div>
          
          <div style="padding: 30px; background: #f8f9fa; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Hello ${firstName},</h2>
            
            <p style="color: #555; line-height: 1.6;">
              We received a request to reset your password for your Devnovate Blog Platform account.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #6f42c1;">
              <p style="color: #555; line-height: 1.6; margin: 0;">
                <strong>If you didn't request this, please ignore this email.</strong> Your password will remain unchanged.
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background: linear-gradient(135deg, #6f42c1 0%, #e83e8c 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">
                Reset Password
              </a>
            </div>
            
            <p style="color: #777; font-size: 14px; text-align: center; margin-top: 30px;">
              This link will expire in 1 hour for security reasons.
            </p>
            
            <p style="color: #555; line-height: 1.6;">
              If the button above doesn't work, you can copy and paste this link into your browser:
            </p>
            
            <p style="color: #6f42c1; word-break: break-all; font-size: 14px;">
              ${resetUrl}
            </p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to ${email}`);
  } catch (error) {
    console.error('Password reset email failed:', error);
    throw error;
  }
};

// Send comment notification email
const sendCommentNotificationEmail = async (authorEmail, authorName, commenterName, blogTitle, commentContent) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"Devnovate Blog Platform" <${process.env.EMAIL_USER}>`,
      to: authorEmail,
      subject: `💬 New Comment on "${blogTitle}"`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #17a2b8 0%, #20c997 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">New Comment 💬</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Someone engaged with your content</p>
          </div>
          
          <div style="padding: 30px; background: #f8f9fa; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Hello ${authorName},</h2>
            
            <p style="color: #555; line-height: 1.6;">
              <strong>${commenterName}</strong> just left a comment on your blog post "<strong>${blogTitle}</strong>".
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #17a2b8;">
              <h3 style="color: #333; margin-top: 0;">Comment:</h3>
              <p style="color: #555; line-height: 1.6; font-style: italic;">
                "${commentContent}"
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/dashboard" 
                 style="background: linear-gradient(135deg, #17a2b8 0%, #20c997 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">
                View Comment
              </a>
            </div>
            
            <p style="color: #555; line-height: 1.6;">
              Keep engaging with your readers! Comments help build a vibrant community around your content.
            </p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Comment notification email sent to ${authorEmail}`);
  } catch (error) {
    console.error('Comment notification email failed:', error);
    throw error;
  }
};

module.exports = {
  sendWelcomeEmail,
  sendBlogStatusEmail,
  sendPasswordResetEmail,
  sendCommentNotificationEmail
};

