import { Commit, Dispatch, Getter } from 'vuex';

export type BaseState = Object;

export interface RootState {
    [module: string]: BaseState
}

export interface Context<S> {
    commit: Commit
    dispatch: Dispatch
    getters: {
        [key: string]: Getter<S, RootState>
    }
    state: S
}
