import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { APP_TITLE } from "@/const";
import { trpc } from "@/lib/trpc";
import { FileText, Plus, Trash2 } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

export default function QuotationList() {
  const { user } = useAuth();
  const [deleteId, setDeleteId] = useState<number | null>(null);
  
  const quotationsQuery = trpc.quotations.list.useQuery();
  const deleteMutation = trpc.quotations.delete.useMutation({
    onSuccess: () => {
      toast.success("Quotation deleted successfully");
      quotationsQuery.refetch();
      setDeleteId(null);
    },
    onError: (error) => {
      toast.error(`Failed to delete quotation: ${error.message}`);
    }
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <h1 className="text-xl font-bold cursor-pointer hover:text-blue-600">{APP_TITLE}</h1>
            </Link>
          </div>
          <span className="text-sm text-gray-600">Welcome, {user?.name || user?.email}</span>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">My Quotations</h2>
            <p className="text-gray-600">Manage and export your quotations</p>
          </div>
          <Link href="/quotations/new">
            <Button size="lg">
              <Plus className="h-5 w-5 mr-2" />
              New Quotation
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Quotations</CardTitle>
            <CardDescription>View and manage your saved quotations</CardDescription>
          </CardHeader>
          <CardContent>
            {quotationsQuery.isLoading && (
              <div className="text-center py-12 text-gray-500">Loading quotations...</div>
            )}

            {quotationsQuery.error && (
              <div className="text-center py-12 text-red-500">
                Error loading quotations: {quotationsQuery.error.message}
              </div>
            )}

            {quotationsQuery.data && quotationsQuery.data.length === 0 && (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 mb-4">No quotations yet</p>
                <Link href="/quotations/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Quotation
                  </Button>
                </Link>
              </div>
            )}

            {quotationsQuery.data && quotationsQuery.data.length > 0 && (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Quotation Number</TableHead>
                      <TableHead>Customer Name</TableHead>
                      <TableHead>Exchange Rate</TableHead>
                      <TableHead>Created Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {quotationsQuery.data.map((quotation: any) => (
                      <TableRow key={quotation.id} className="cursor-pointer hover:bg-gray-50">
                        <TableCell className="font-medium">
                          <Link href={`/quotations/${quotation.id}`}>
                            <span className="text-blue-600 hover:underline">
                              {quotation.quotationNumber}
                            </span>
                          </Link>
                        </TableCell>
                        <TableCell>{quotation.customerName || '-'}</TableCell>
                        <TableCell>{quotation.exchangeRate}</TableCell>
                        <TableCell>{formatDate(quotation.createdAt)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Link href={`/quotations/${quotation.id}`}>
                              <Button variant="outline" size="sm">
                                View
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteId(quotation.id);
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the quotation and all its items.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteId) {
                  deleteMutation.mutate({ id: deleteId });
                }
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

