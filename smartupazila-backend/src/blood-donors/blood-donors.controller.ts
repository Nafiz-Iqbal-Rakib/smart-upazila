import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { BloodDonorsService } from './blood-donors.service';
import { BloodGroup } from './blood-donor.entity';
import { CreateBloodDonorDto } from './dto/create-blood-donor.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Role } from '../users/user.entity';

@ApiTags('blood-donors')
@Controller('blood-donors')
