import { Controller, Get } from '@nestjs/common';
import { PlansService } from './plans.service';

@Controller('plans')
export class PlansController {
  // Inyectamos el servicio que consulta los planes.
  constructor(private readonly plansService: PlansService) {}

  // GET /api/plans
  @Get()
  findAll() {
    return this.plansService.findAll();
  }
}
