import { createAction, props} from '@ngrx/store';
import { Session } from '../../core/models/app.models';

export const loadSessions = createAction('[Analysis] Load Session');
export const loadSessionsSuccess = createAction(
    '[Analysis] Load Sessions Success',
    props<{ sessions: Session[] }>(),
);
export const loadSessionsFailure = createAction(
    '[Analysis] Load Sessions Failure',
    props<{ error: string }>(),
);
