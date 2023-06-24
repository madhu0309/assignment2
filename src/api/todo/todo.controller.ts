import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Delete,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CreateTodoDto, UpdateTodoDto } from './todo.dto';
import { Todo } from './todo.entity';
import { TodoService } from './todo.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('todos')
export class TodoController {
  @Inject(TodoService)
  private readonly service: TodoService;

  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @Get(':id')
  public getTodo(@Param('id', ParseIntPipe) id: number): Promise<Todo> {
    return this.service.getTodo(id);
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @Get()
  public getTodos(@Request() req): Promise<any> {
    const userId = req.user.sub;
    const sort = req.query.sort;
    const page = req.query.page;
    const search = req.query.search;
    return this.service.getTodos(userId, search, sort, page);
  }

  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard)
  @Post()
  public createTodo(
    @Request() req,
    @Body() body: CreateTodoDto,
  ): Promise<Todo> {
    const userId = req.user.sub;
    return this.service.createTodo(body, userId);
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @Put(':id')
  public updateTodo(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateTodoDto,
  ): Promise<Todo> {
    return this.service.updateTodo(id, body);
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @Delete(':id')
  public deleteTodo(@Param('id', ParseIntPipe) id: number) {
    return this.service.deleteTodo(id);
  }
}
