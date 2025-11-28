export const CURRENT_DATE =   new Date().toISOString().split('T')[0];
export const TOMMOROW_DATE =  new Date(Date.now() + 86400000).toISOString().split('T')[0];
export const YESTERDAY_DATE = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    