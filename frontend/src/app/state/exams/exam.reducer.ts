import { createEntityAdapter, EntityAdapter, EntityState} from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';
import { Exam } from '../../core/services/exam.service';
import * as ExamActions from './exam.actions';


export interface ExamsState extends EntityState<Exam> {
    loading: boolean;
    loaded: boolean;
    error: string | null;
}

export const examsAdapter : EntityAdapter<Exam> = createEntityAdapter<Exam>({
    selectId: (exam) => exam.id,
});

export const initialState: ExamsState = examsAdapter.getInitialState({
    loading: false,
    loaded: false,
    error: null,
})

export const examsReducer = createReducer(
    initialState,
    on(ExamActions.loadExams, (state) => ({...state, loading: true, error: null}),),
    on(ExamActions.loadExamsSuccess, (state, {exams}) =>
        examsAdapter.setAll(exams, {...state, loading: false, loaded: true}),
    ),
    on(ExamActions.loadExamsFailure, (state, {error}) => ({...state, loading: false, error}),)
);
