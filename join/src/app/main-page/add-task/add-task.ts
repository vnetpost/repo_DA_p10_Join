import { Component } from '@angular/core';
import { AddTaskA } from './add-task-a/add-task-a';
import { AddTaskB } from './add-task-b/add-task-b';

@Component({
  selector: 'app-add-task',
  imports: [AddTaskA, AddTaskB],
  templateUrl: './add-task.html',
  styleUrl: './add-task.scss',
})
export class AddTask {}
