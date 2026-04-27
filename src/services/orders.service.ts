import { companyOrders, notaryOrders, orderTimeline, pipeline } from '@/constants/mockData';

export async function getCompanyOrders() {
  return companyOrders;
}

export async function getNotaryOrders() {
  return notaryOrders;
}

export async function getOrderTimeline() {
  return orderTimeline;
}

export async function getOrderPipeline() {
  return pipeline;
}
