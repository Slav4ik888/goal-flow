import type { AnyAction, ThunkDispatch } from '@reduxjs/toolkit';
import type { StateSchema, ThunkExtraArg } from './state';
import type { Errors } from '@shared/lib/validators';
import { __devLog } from '@shared/lib/tests/__dev-log';



export interface CustomAxiosError {
  code     : string
  stack    : string
  response : {
    status : number
    data   : Errors
    config : {
      url: string
    }
  }
}


interface ErrorHandlersConfig {
  pathname? : string
}

export const errorHandlers = (
  e        : CustomAxiosError,
  dispatch : ThunkDispatch<StateSchema, ThunkExtraArg, AnyAction>,
  cfg      : ErrorHandlersConfig = {}
) => {
  __devLog('errorHandlers', 'e: ', e);
  __devLog('errorHandlers', 'response: ', e.response);
  __devLog('errorHandlers', 'status: ', e.response?.status);
  __devLog('errorHandlers', 'stack: ', e.stack);

  // dispatch(actions.setPageLoading()); // Снять крутилку
}
