import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User, Admin } from 'common/models';
import { JwtUtility } from 'common/utils';
import { Repository } from 'typeorm';
@Injectable()
export class SocketService {
    constructor(
        @InjectRepository(User) private userRepository: Repository<User>,
        @InjectRepository(Admin) private adminRepository: Repository<Admin>,
    ){}


    async authUser( token: string ): Promise<object>{
        if( !token ){
            return {success: false, message: "token rquired"}
        }
        const payload = await JwtUtility.verifyToken(token);
        const id = payload.sub
        try {
            const user:any = await this.getUser( id )
            if (!user ) {
                return {success: false, message: "Unauthorized"}
            }

            if (user.isSuspended) {
                return {success: false, message: "Your account has been suspended"}
            }
      
            if(user){
                return {success: true, user, message: "Login Successfully"}
            }  
          } catch (error) {
            return {success: false, message: "Something error found"}
          }
        
    }

    async authUserAdmin( token: string, userType: string ): Promise<object>{
        if( !token ){
            return {success: false, message: "token rquired"}
        }
        const payload = await JwtUtility.verifyToken(token);
        const id = payload?.sub
        let user:any;
        try {
            if(userType === 'ADMIN'){
                user = await this.getAdmin(id);
            }else{
                user = await this.getUser(id);
            }
            if (!user ) {
                return {success: false, message: "Unauthorized"}
            }

            if (user.isSuspended) {
                return {success: false, message: "Your account has been suspended"}
            }
      
            if(user){
                return {success: true, user, message: "Login Successfully"}
            }  
            
          } catch (error) {
            return {success: false, message: "Something error found"}
          }
        
    }

    async getUser( id:any ): Promise<any>{
        const user = await this.userRepository.findOne({
            where: {
              id,
              isDeleted: false
            },
          });
        return JSON.parse( JSON.stringify(user) )
    }

    async getAdmin( id:any ): Promise<any>{
        const user = await this.adminRepository.findOne({
            where: {
              id,
              isDeleted: false
            },
          });
        return JSON.parse( JSON.stringify(user) )
    }

}
