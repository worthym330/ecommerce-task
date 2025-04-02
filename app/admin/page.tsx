"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
interface UserStats {
  userId: string;
  orderCount: number;
  totalSpent: number;
}

interface DiscountCode {
  code: string;
  used: boolean;
  userId?: string;
}
export default function AdminPage() {
  const [stats, setStats] = useState<{
    totalOrders: number;
    totalItemsPurchased: number;
    totalPurchaseAmount: number;
    discountCodes: DiscountCode[];
    totalDiscountAmount: number;
    userStats: UserStats[];
  }>({
    totalOrders: 0,
    totalItemsPurchased: 0,
    totalPurchaseAmount: 0,
    discountCodes: [],
    totalDiscountAmount: 0,
    userStats: [],
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/stats");
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
    setLoading(false);
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Link href="/admin/discounts">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Manage Discount Codes
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Items Purchased
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalItemsPurchased}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.totalPurchaseAmount.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Discounts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.totalDiscountAmount.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>User Statistics</CardTitle>
            <CardDescription>Order counts and spending by user</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading...</p>
            ) : stats.userStats.length === 0 ? (
              <p className="text-muted-foreground">No user data available</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User ID</TableHead>
                    <TableHead>Orders</TableHead>
                    <TableHead>Total Spent</TableHead>
                    <TableHead>Next Discount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.userStats.map((user, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        {user.userId.substring(0, 8)}...
                      </TableCell>
                      <TableCell>{user.orderCount}</TableCell>
                      <TableCell>${user.totalSpent.toFixed(2)}</TableCell>
                      <TableCell>
                        {user.orderCount % 3 === 0 ? (
                          <Badge variant="default">Eligible</Badge>
                        ) : (
                          <span>{3 - (user.orderCount % 3)} more order(s)</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Discount Codes</CardTitle>
            <CardDescription>
              All discount codes and their usage status
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading...</p>
            ) : stats.discountCodes.length === 0 ? (
              <p className="text-muted-foreground">
                No discount codes generated yet
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>User</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.discountCodes.map((code, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{code.code}</TableCell>
                      <TableCell>
                        {code.used ? (
                          <Badge variant="secondary">Used</Badge>
                        ) : (
                          <Badge variant="default">Available</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {code.userId
                          ? code.userId.substring(0, 8) + "..."
                          : "Admin Generated"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
