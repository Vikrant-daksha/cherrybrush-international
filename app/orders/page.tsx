import { Metadata } from "next";
import OrdersClient from "./OrdersClient";

export const metadata: Metadata = {
  title: "My Orders | Cherrybrush",
  description: "View and track your handcrafted press-on nail orders.",
};

export default function OrdersPage() {
  return <OrdersClient />;
}
