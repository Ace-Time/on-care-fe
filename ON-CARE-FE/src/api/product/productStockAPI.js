import api from '@/lib/api';
import { PAGE_CONSTANT } from '../constants/common';

export const getExpectedStock = async({
    page, 
    size, 
    status, 
    expectedDate ,
    isConfirmed,
    productNameOrProductCode,
    startDate,
    endDate, 
}) => {

    const params ={
        page,
        ...(size != null ? {size} : PAGE_CONSTANT),
        ...(status != null ? {status} : {}),
        ...(expectedDate != null ? {expectedDate} : {}),
        ...(isConfirmed != null ? {isConfirmed} : {}),
        ...(productNameOrProductCode != null && productNameOrProductCode != '' ? {productNameOrProductCode} : {}),
        ...(startDate != null && startDate != '' ? {expectedStartDate : startDate} : {}),
        ...(endDate != null && endDate != '' ? {expectedEndDate : endDate} : {}),
    }

    const res = await api.get('/api/product/stock',{params});
    return res.data;
};


export const getProductStatus = async() => {
    const res = await api.get('/api/product/product-status');
    return res.data;
};

export const getProducts = async({page, size, productCode, productStatus })  => {
    const params ={
        page,
        ...(size != null ? {size} : PAGE_CONSTANT),
        productCode,
        ...(productStatus != null ? {productStatus} : {})
    }

    const res = await api.get('/api/product/product',{params});
    return res.data;
};

export const getProductHistory = async({page, size, productId, historyStatus })  => {
    const params ={
        page,
        ...(size != null ? {size} : PAGE_CONSTANT),
        productId,
        ...(historyStatus != null ? {historyStatus} : {})
    }

    const res = await api.get('/api/product/product-history',{params});
    return res.data;
};

export const getBeneficaryForRental = async(name) => {
    const res = await api.get(`/api/beneficiaries/rental/${name}`);
    return res.data;
}
