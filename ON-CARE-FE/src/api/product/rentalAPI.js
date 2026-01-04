import api from '@/lib/api';
import { PAGE_CONSTANT } from '../constants/common';

export const getRenal = async({page, size, beneficiaryOrEmployee, contractStatus }) => { 
    const params ={
        page,
        ...(size != null ? {size} : PAGE_CONSTANT),
        ...(beneficiaryOrEmployee != null && beneficiaryOrEmployee != '' ? {beneficiaryOrEmployee} : {}),
        ...(contractStatus != null ? {contractStatus} : {})
    }

    const res = await api.get('/api/rental/rental',{params});
    return res.data;
};

export const getRentalStatus = async() => {
    const res = await api.get('/api/rental/rental-product/status');
    return res.data;
};

export const getContractStatus = async() => {
    const res = await api.get('/api/rental/contract/type');
    return res.data;
};

export const getRentalItems = async(id) => {
    const params = {
            contractCode : id
        };
    const res = await api.get('/api/rental/rental-product',{params});
    return res.data;
};

export const createRentalContract = async({
    beneficiaryId, empId, productCd, wantedDate, termMonth}) => {

    const params = {
        beneficiaryId,
        empId,
        productCd,
        wantedDate,
        termMonth
    }
    const res = await api.post('/api/rental/contract',params);

    return res.data;
}

export const updateRentalContract = async({
    id,
    expectedDate,
    wantedDate,
    contractStatusCd
}) => {
    const params = {
        id,
        ...(expectedDate == null ? {} : {expectedDate}),
        ...(wantedDate == null ? {} : {wantedDate}),
        ...(contractStatusCd == null ? {} : {contractStatusCd})
    }
    console.log("params::",params)

    const res = await api.patch('/api/rental/contract', params);
    return res.data;
}

export const terminateRentalContract = async({
    id,
    endDate,
    contractStatusCd
}) => {
    const params = {
        id,
        ...(endDate == null ? {} : {endDate}),
        contractStatusCd
    }
    console.log("params::",params)

    const res = await api.patch('/api/rental/contract/termination', params);
    return res.data;
}
