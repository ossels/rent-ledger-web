import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import type { Response } from "express";
import { Matches } from "class-validator";
import { diskStorage } from "multer";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { EntriesService, receiptsDir } from "./entries.service";
import { CreateEntryDto, CreatePaymentDto, ListEntriesQuery, UpdateEntryDto } from "./entries.dto";
import { Query } from "@nestjs/common";

class PrefillDto {
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, { message: "month must look like 2026-08" })
  month: string;
}

const RECEIPT_EXT: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/heic": ".heic",
};

@Controller("entries")
export class EntriesController {
  constructor(private entries: EntriesService) {}

  @Get()
  findAll(@Query() query: ListEntriesQuery) {
    return this.entries.findAll(query);
  }

  @Post()
  create(@Body() dto: CreateEntryDto) {
    return this.entries.create(dto);
  }

  @Post("prefill")
  prefill(@Body() dto: PrefillDto) {
    return this.entries.prefillMonth(dto.month);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdateEntryDto) {
    return this.entries.update(id, dto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.entries.remove(id);
  }

  // --- Payments ---

  @Post(":id/payments")
  addPayment(@Param("id") id: string, @Body() dto: CreatePaymentDto) {
    return this.entries.addPayment(id, dto);
  }

  @Delete(":id/payments/:paymentId")
  removePayment(@Param("id") id: string, @Param("paymentId") paymentId: string) {
    return this.entries.removePayment(id, paymentId);
  }

  // --- Receipt photo ---

  @Post(":id/receipt")
  @UseInterceptors(
    FileInterceptor("file", {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          const dir = receiptsDir();
          mkdirSync(dir, { recursive: true });
          cb(null, dir);
        },
        filename: (req, file, cb) => {
          const ext = RECEIPT_EXT[file.mimetype] ?? path.extname(file.originalname) ?? ".jpg";
          cb(null, `${req.params.id}${ext}`);
        },
      }),
      limits: { fileSize: 10 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        cb(null, file.mimetype.startsWith("image/"));
      },
    }),
  )
  uploadReceipt(@Param("id") id: string, @UploadedFile() file?: Express.Multer.File) {
    if (!file) throw new BadRequestException("Attach one image file (max 10 MB)");
    return this.entries.setReceipt(id, file.filename);
  }

  @Get(":id/receipt")
  async getReceipt(@Param("id") id: string, @Res() res: Response) {
    const filePath = await this.entries.getReceiptPath(id);
    res.sendFile(filePath);
  }

  @Delete(":id/receipt")
  removeReceipt(@Param("id") id: string) {
    return this.entries.removeReceipt(id);
  }
}
