import HTTP_STATUS from 'http-status-codes';
import { Request, Response } from 'express';
import { config } from '@root/config';
import JWT from 'jsonwebtoken';
import { joiValidation } from '@global/decorators/joi-validation.decorators';
import { authService } from '@service/db/auth.service';
import { BadRequestError } from '@global/helpers/error-handler';
import { loginSchema } from '@auth/schemes/signin';
import { IAuthDocument } from '@auth/interfaces/auth.interface';
// import { emailQueue } from '@service/queues/email.queue';
// import moment from 'moment';
// import publicIP from 'ip';
// import { resetPasswordTemplate } from '@service/emails/templates/reset-password/reset-password-template';
// import { IResetPasswordParams } from '@user/interfaces/user.interface';


export class SignIn {
  @joiValidation(loginSchema)
  public async read(req: Request, res: Response): Promise<void> {
    const { username, password } = req.body;
    const existingUser: IAuthDocument = await authService.getAuthUserByUsername(username);
    if (!existingUser) {
      throw new BadRequestError('Invalid Credentials');
    }

    const passwordMatch: boolean = await existingUser.comparePassword(password);
    if (!passwordMatch) {
      throw new BadRequestError('Invalid Credentials');
    }

    const userJwt: string = JWT.sign(
      {
        userId: existingUser._id,
        uId: existingUser.uId,
        email: existingUser.email,
        username: existingUser.username
      },
      config.JWT_TOKEN!
    );

    // const templateParams: IResetPasswordParams = {
    //   username: existingUser!.username,
    //   email: existingUser!.email,
    //   ipaddress: publicIP.address(),
    //   date: moment().format('DD/MM/YYYY HH:mm')
    // };
    // const template: string = resetPasswordTemplate.passwordResetConfirmationTemplate(templateParams);
    // emailQueue.addEmailJob('forgotPasswordEmail', {template, receiverEmail: 'annabel41@ethereal.email', subject: 'Password reset confirmation'});

    req.session = { jwt: userJwt };
    res.status(HTTP_STATUS.OK).json({ message: 'User logged successfully', user: existingUser, token: userJwt});
  }
}
