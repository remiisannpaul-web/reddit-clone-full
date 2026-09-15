import { Injectable } from '@nestjs/common';
import { CreateUserServiceDto } from './dto/create-user-service.dto';
import { UpdateUserServiceDto } from './dto/update-user-service.dto';
import { UserRepository } from './repositories/user.repository';

@Injectable()
export class UserServiceService {
  constructor(private readonly userRepository: UserRepository) {}

  public async modifyName(newName: string, userId: string) {
    try {
      const updatedRows = await this.userRepository.updateName(newName, userId);

      if (updatedRows === 0) {
        return {
          success: false,
          message: 'User not found',
        };
      }

      return {
        success: true,
        message: 'Name updated',
      };
    } catch (error) {
      return {
        success: false,
        message: 'Database error',
      };
    }
  }

  public async modifyDisplayName(newDisplayName: string, userId: string) {
    try {
      const updatedRows = await this.userRepository.updateDisplayName(
        newDisplayName,
        userId,
      );

      if (updatedRows === 0) {
        return {
          success: false,
          message: 'User not found',
        };
      }

      return {
        success: true,
        message: 'Display name updated',
      };
    } catch {
      return {
        success: false,
        message: 'Database error',
      };
    }
  }

  create(_createUserServiceDto: CreateUserServiceDto) {
    return 'This action adds a new userService';
  }

  findAll() {
    return 'This action returns all userService';
  }

  findOne(id: string) {
    return this.userRepository.findOne(id);
  }

  update(id: number, updateUserServiceDto: UpdateUserServiceDto) {
    return `This action updates a #${id} userService`;
  }

  remove(id: number) {
    return `This action removes a #${id} userService`;
  }
}
