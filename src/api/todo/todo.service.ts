import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTodoDto } from './todo.dto';
import { Todo } from './todo.entity';
import { UserService } from '../user/user.service';

@Injectable()
export class TodoService {
  constructor(private userService: UserService) {}

  @InjectRepository(Todo)
  private readonly repository: Repository<Todo>;

  public getTodo(id: number): Promise<Todo> {
    return this.repository.findOne({ where: { id: id } });
  }

  public async getTodos(
    userId: number,
    search: string,
    sort: 'DESC' | 'ASC',
    page: number,
  ): Promise<any> {
    const query = this.repository.createQueryBuilder('todo');
    query.where('todo.creator = :userId', { userId });
    if (search) {
      query.where('LOWER(todo.title) LIKE LOWER(:title)', {
        title: `%${search}%`,
      });
    }

    if (sort === 'ASC') {
      query.orderBy('todo.title', 'ASC');
    } else if (sort === 'DESC') {
      query.orderBy('todo.title', 'DESC');
    }

    const pageNumber: number = parseInt(page as any) || 1;
    const perPage = 10;
    const total = await query.getCount();

    query.offset((pageNumber - 1) * perPage).limit(perPage);

    const todos = await query.getMany();
    return {
      data: todos,
      total,
      pageNumber,
      lastPage: Math.ceil(total / perPage),
    };
  }

  public async createTodo(body: CreateTodoDto, userId: number): Promise<Todo> {
    const todo: Todo = new Todo();
    const user = await this.userService.getUser(userId);

    todo.title = body.title;
    todo.description = body.description;
    todo.status = body.status;
    todo.creator = user;
    const currentTodo = await this.repository.save(todo);
    delete currentTodo.creator;
    return currentTodo;
  }

  public updateTodo(id: number, body: CreateTodoDto): Promise<Todo> {
    return this.repository.save({
      id: id,
      ...body,
    });
  }

  public deleteTodo(id: number) {
    return this.repository.delete({
      id: id,
    });
  }
}
