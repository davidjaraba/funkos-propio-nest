import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, Put, ParseIntPipe } from "@nestjs/common";
import { FunkosService } from './funkos.service';
import { CreateFunkoDto } from './dto/create-funko.dto';
import { UpdateFunkoDto } from './dto/update-funko.dto';

@Controller('v1/funkos')
export class FunkosController {
  constructor(private readonly funkosService: FunkosService) {}

  @Post()
  @HttpCode(201)
  create(@Body() createFunkoDto: CreateFunkoDto) {
    return this.funkosService.create(createFunkoDto);
  }

  @Get()
  findAll() {
    return this.funkosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.funkosService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: string, @Body() updateFunkoDto: UpdateFunkoDto) {
    return this.funkosService.update(+id, updateFunkoDto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', ParseIntPipe) id: string) {
    return this.funkosService.remove(+id);
  }
}
