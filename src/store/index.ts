import { createStore, createTypedHooks } from 'easy-peasy';
import { setInitState, store } from './store';
import { StoreModel } from '../types/StoreTypes';

const typedHooks = createTypedHooks<StoreModel>();

export const { useStoreActions } = typedHooks;
export const { useStoreDispatch } = typedHooks;
export const { useStoreState } = typedHooks;

export const initializeStore = (initialState?: StoreModel) => {
  setInitState(initialState);
  return createStore(store, {
    initialState,
  });
};
