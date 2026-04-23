"use client";

import { useEffect, useState } from "react";
import { getBooks, getSales, adminReset, adminAddJunk, getToken } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { LogOut, RefreshCw, BookOpen, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export default function DashboardPage() {
  const [books, setBooks] = useState<any[]>([]);
  const [sales, setSales] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const bData = await getBooks();
      const sData = await getSales();
      setBooks(bData);
      setSales(sData);
    } catch (e) {
      toast.error("Failed to fetch data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = getToken();
    if (!token) {
      window.location.href = "/login";
      return;
    }
    fetchData();

    const handleKeyDown = async (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.code === "KeyR") {
        await handleReset();
      } else if (e.ctrlKey && e.shiftKey && e.code === "KeyJ") {
        await handleAddJunk();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleReset = async () => {
    try {
      toast.info("Resetting to Golden State...");
      await adminReset();
      await fetchData();
      toast.success("Database restored to Golden Demo State!");
    } catch (e) {
      toast.error("Not authorized to reset");
    }
  };

  const handleAddJunk = async () => {
    try {
      toast.warning("Injecting corrupted data...");
      await adminAddJunk();
      await fetchData();
    } catch (e) {
      toast.error("Not authorized");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] p-8 dark:bg-zinc-950">
      <div className="max-w-[1200px] mx-auto space-y-6">
        <div className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded shadow-sm border border-zinc-200">
              <BookOpen className="w-8 h-8 text-zinc-800" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Inventory Dashboard</h1>
              <p className="text-sm text-zinc-500">Sales-Ready Demo Environment</p>
            </div>
          </div>
          <div className="flex gap-4">
            <Button variant="outline" onClick={handleLogout} className="shadow-sm">
              <LogOut className="w-4 h-4 mr-2" /> Logout
            </Button>
            <Button variant="outline" onClick={handleReset} className="border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100 shadow-sm">
              <RefreshCw className="w-4 h-4 mr-2" /> Admin Reset
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Books Table */}
          <Card className="col-span-1 md:col-span-2 shadow-sm border-zinc-200">
            <CardHeader className="bg-zinc-50 border-b border-zinc-100 rounded-t-xl">
              <CardTitle className="text-lg text-zinc-700">Book List</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-zinc-50/50 hover:bg-zinc-50/50">
                    <TableHead className="w-[100px] pl-6">Cover Image</TableHead>
                    <TableHead>Book Title</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead className="text-right pr-6">Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow><TableCell colSpan={4} className="text-center py-10 opacity-50">Loading inventory data...</TableCell></TableRow>
                  ) : books.length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="text-center py-10 text-red-500 font-medium">Database is empty. Please press Admin Reset.</TableCell></TableRow>
                  ) : (
                    books.map((book) => (
                      <TableRow key={book.id}>
                        <TableCell className="pl-6">
                          {book.cover_image_url ? 
                            <img src={book.cover_image_url} alt={book.title} className="w-10 h-14 object-cover rounded shadow shadow-zinc-300" /> 
                            : <div className="w-10 h-14 bg-zinc-200 flex items-center justify-center rounded text-zinc-400 border border-zinc-300"><AlertTriangle className="w-5 h-5 text-zinc-400" /></div>
                          }
                        </TableCell>
                        <TableCell className="font-medium text-zinc-800">{book.title}</TableCell>
                        <TableCell className="text-zinc-600">{book.author}</TableCell>
                        <TableCell className="text-right pr-6 font-medium">
                          {book.price > 100000 ? (
                            <span className="text-red-600 bg-red-50 px-2 py-1 rounded truncate inline-block max-w-[120px] shadow-sm ring-1 ring-red-200">${book.price}</span>
                          ) : (
                            `₺${book.price.toFixed(2)}`
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Sales Chart */}
          <Card className="col-span-1 md:col-span-2 shadow-sm border-zinc-200">
            <CardHeader className="bg-zinc-50 border-b border-zinc-100 rounded-t-xl">
              <CardTitle className="text-lg text-zinc-700">Monthly Revenue</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 h-[300px]">
              {sales.length === 0 ? (
                <div className="h-full flex items-center justify-center text-zinc-400">No Sales Data Available</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sales.map((s, i) => ({ name: `Sale ${i}`, amount: s.quantity * (s.book?.price || 0) }))}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="name" hide />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} tickFormatter={(value) => `₺${value}`} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      formatter={(value: any) => [`₺${Number(value).toFixed(2)}`, 'Revenue']}
                    />
                    <Line type="monotone" dataKey="amount" stroke="#0284c7" strokeWidth={3} dot={{r: 4, fill: '#0284c7', strokeWidth: 2, stroke: '#fff'}} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>
        <div className="flex flex-col items-center justify-center mt-12 bg-white rounded-lg p-4 border border-blue-100 shadow-sm max-w-lg mx-auto">
          <p className="text-center text-sm text-blue-800 font-medium pb-1">
            SECRET DEMO CONTROLS 🕵️‍♂️
          </p>
          <p className="text-center text-xs text-blue-600">
            <b>Ctrl+Shift+J</b> : Inject corrupt/junk state (State 1)<br/>
            <b>Ctrl+Shift+R</b> : Reset to perfect Golden state (State 2)
          </p>
        </div>
      </div>
    </div>
  );
}
