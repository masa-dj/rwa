import { createEntityAdapter, EntityAdapter, EntityState} from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';
import { Session } from '../../core/models/app.models';
import * as SessionActions from './session.actions';


export interface SessionsState extends EntityState<Session> {
    loading: boolean;
    loaded: boolean;
    error: string | null;
}

export const sessionsAdapter : EntityAdapter<Session> = createEntityAdapter<Session>({
    selectId: (session) => session.id,
});

export const initialState: SessionsState = sessionsAdapter.getInitialState({
    loading: false,
    loaded: false,
    error: null,
})

export const sessionReducer = createReducer(
    initialState,
    on(SessionActions.loadSessions, (state) => ({...state, loading: true, error: null}),),
    on(SessionActions.loadSessionsSuccess, (state, {sessions}) =>
        sessionsAdapter.setAll(sessions, {...state, loading: false, loaded: true}),
    ),
    on(SessionActions.loadSessionsFailure, (state, {error}) => ({...state, loading: false, error}),)
);
