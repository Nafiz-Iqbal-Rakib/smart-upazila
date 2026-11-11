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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { CommunityService } from './community.service';
import { ListingType } from './community-listing.entity';
import { CreateCommunityListingDto } from './dto/create-community-listing.dto';
import { UpdateCommunityListingDto } from './dto/update-community-listing.dto';
import { Roles } from '../common/decorators/roles.decorator';
