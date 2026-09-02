import { createAction, props} from '@ngrx/store';
import { Exam } from '../../core/services/exam.service';

export const loadExams = createAction('[Exams] Load Exam');
export const loadExamsSuccess = createAction(
    '[Exams] Load Exams Success',
    props<{ exams: Exam[] }>(),
);
export const loadExamsFailure = createAction(
    '[Exams] Load Exams Failure',
    props<{ error: string }>(),
);
