import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Link } from "wouter";
import { ArrowLeft, Plus, Search, Edit, Trash2, Save, ChevronLeft, ChevronRight } from "lucide-react";
import { APP_TITLE } from "@/const";

export default function PriceManagement() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  // Form state for add/edit
  const [formData, setFormData] = useState({
    product: "",
    description: "",
    pack: "",
    cutOff: "",
    baseUsdFinished: "",
    baseRmbFinished: "",
    baseUsdBulk: "",
    baseRmbBulk: "",
  });

  const pageSize = 10;
  const [page, setPage] = useState(1);
  const [pageInput, setPageInput] = useState("1");
  const offset = (page - 1) * pageSize;

  const searchMutation = trpc.products.search.useQuery(
    { query: searchQuery, limit: pageSize, offset },
    { enabled: searchQuery.length > 0, keepPreviousData: true }
  );

  const allProductsQuery = trpc.products.search.useQuery(
    { query: "", limit: pageSize, offset },
    { enabled: searchQuery.length === 0, keepPreviousData: true }
  );

  const activeData = searchQuery.length > 0 ? searchMutation.data : allProductsQuery.data;
  // Items and total from backend pagination
  const products = activeData?.items ?? [];
  const total = activeData?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const canGoPrev = page > 1;
  const canGoNext = page < totalPages;

  const goToInputPage = () => {
    const n = parseInt(pageInput || "1", 10);
    const target = isNaN(n) ? 1 : Math.min(totalPages, Math.max(1, n));
    setPage(target);
    setPageInput(String(target));
  };

  const handleEdit = (product: any) => {
    setSelectedProduct(product);
    setFormData({
      product: product.product,
      description: product.description || "",
      pack: product.pack || "",
      cutOff: product.cutOff || "",
      baseUsdFinished: product.baseUsdFinished.toString(),
      baseRmbFinished: product.baseRmbFinished.toString(),
      baseUsdBulk: product.baseUsdBulk.toString(),
      baseRmbBulk: product.baseRmbBulk.toString(),
    });
    setEditDialogOpen(true);
  };

  const handleAdd = () => {
    setFormData({
      product: "",
      description: "",
      pack: "",
      cutOff: "",
      baseUsdFinished: "",
      baseRmbFinished: "",
      baseUsdBulk: "",
      baseRmbBulk: "",
    });
    setAddDialogOpen(true);
  };

  const handleSave = () => {
    // TODO: Implement save functionality via tRPC
    toast.success("Product updated successfully");
    setEditDialogOpen(false);
  };

  const handleAddProduct = () => {
    // TODO: Implement add functionality via tRPC
    toast.success("Product added successfully");
    setAddDialogOpen(false);
  };

  const handleDelete = (product: any) => {
    if (confirm(`Are you sure you want to delete ${product.product}?`)) {
      // TODO: Implement delete functionality via tRPC
      toast.success("Product deleted successfully");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{APP_TITLE}</h1>
              <p className="text-sm text-gray-500">Price Management</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">Welcome, {user?.name || "User"}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Product Base Prices</CardTitle>
                <CardDescription>Manage your product pricing information</CardDescription>
              </div>
              <Button onClick={handleAdd}>
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </div>
            <div className="mt-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                    setPageInput("1");
                  }}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Pack</TableHead>
                    <TableHead>Cut-Off</TableHead>
                    <TableHead className="text-right">Finished USD</TableHead>
                    <TableHead className="text-right">Finished RMB</TableHead>
                    <TableHead className="text-right">Bulk USD</TableHead>
                    <TableHead className="text-right">Bulk RMB</TableHead>
                    <TableHead className="w-32">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products && products.length > 0 ? (
                    products.map((product: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{product.product}</TableCell>
                        <TableCell className="max-w-xs truncate">{product.description}</TableCell>
                        <TableCell>{product.pack}</TableCell>
                        <TableCell>{product.cutOff}</TableCell>
                        <TableCell className="text-right">${product.baseUsdFinished.toFixed(4)}</TableCell>
                        <TableCell className="text-right">¥{product.baseRmbFinished.toFixed(2)}</TableCell>
                        <TableCell className="text-right">${product.baseUsdBulk.toFixed(4)}</TableCell>
                        <TableCell className="text-right">¥{product.baseRmbBulk.toFixed(2)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(product)}
                            >
                              <Edit className="h-4 w-4 text-blue-500" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(product)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                        No products found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            {/* Pagination */}
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-500">Page {page} / {totalPages}</div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setPage(p => { const np = Math.max(1, p - 1); setPageInput(String(np)); return np; })}
                  disabled={!canGoPrev}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setPage(p => { const np = Math.min(totalPages, p + 1); setPageInput(String(np)); return np; })}
                  disabled={!canGoNext}
                >
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
                <div className="flex items-center gap-2 ml-4">
                  <span className="text-sm text-gray-600">Go to page</span>
                  <Input
                    type="number"
                    inputMode="numeric"
                    min={1}
                    step={1}
                    value={pageInput}
                    onChange={(e) => setPageInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") goToInputPage(); }}
                    className="w-20"
                  />
                  <Button variant="outline" onClick={goToInputPage}>Go</Button>
                </div>
              </div>
            </div>

            {/* Edit Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Edit Product</DialogTitle>
                  <DialogDescription>Update product details and base prices</DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="product">Product</Label>
                    <Input id="product" value={formData.product} onChange={(e) => setFormData({ ...formData, product: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Input id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="pack">Pack</Label>
                    <Input id="pack" value={formData.pack} onChange={(e) => setFormData({ ...formData, pack: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="cutOff">Cut-Off</Label>
                    <Input id="cutOff" value={formData.cutOff} onChange={(e) => setFormData({ ...formData, cutOff: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="baseUsdFinished">Finished USD</Label>
                    <Input id="baseUsdFinished" value={formData.baseUsdFinished} onChange={(e) => setFormData({ ...formData, baseUsdFinished: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="baseRmbFinished">Finished RMB</Label>
                    <Input id="baseRmbFinished" value={formData.baseRmbFinished} onChange={(e) => setFormData({ ...formData, baseRmbFinished: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="baseUsdBulk">Bulk USD</Label>
                    <Input id="baseUsdBulk" value={formData.baseUsdBulk} onChange={(e) => setFormData({ ...formData, baseUsdBulk: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="baseRmbBulk">Bulk RMB</Label>
                    <Input id="baseRmbBulk" value={formData.baseRmbBulk} onChange={(e) => setFormData({ ...formData, baseRmbBulk: e.target.value })} />
                  </div>
                </div>
                <div className="mt-6 flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleSave}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Add Dialog */}
            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Add New Product</DialogTitle>
                  <DialogDescription>Enter product details and base prices</DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="newProduct">Product</Label>
                    <Input id="newProduct" value={formData.product} onChange={(e) => setFormData({ ...formData, product: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="newDescription">Description</Label>
                    <Input id="newDescription" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="newPack">Pack</Label>
                    <Input id="newPack" value={formData.pack} onChange={(e) => setFormData({ ...formData, pack: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="newCutOff">Cut-Off</Label>
                    <Input id="newCutOff" value={formData.cutOff} onChange={(e) => setFormData({ ...formData, cutOff: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="newBaseUsdFinished">Finished USD</Label>
                    <Input id="newBaseUsdFinished" value={formData.baseUsdFinished} onChange={(e) => setFormData({ ...formData, baseUsdFinished: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="newBaseRmbFinished">Finished RMB</Label>
                    <Input id="newBaseRmbFinished" value={formData.baseRmbFinished} onChange={(e) => setFormData({ ...formData, baseRmbFinished: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="newBaseUsdBulk">Bulk USD</Label>
                    <Input id="newBaseUsdBulk" value={formData.baseUsdBulk} onChange={(e) => setFormData({ ...formData, baseUsdBulk: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="newBaseRmbBulk">Bulk RMB</Label>
                    <Input id="newBaseRmbBulk" value={formData.baseRmbBulk} onChange={(e) => setFormData({ ...formData, baseRmbBulk: e.target.value })} />
                  </div>
                </div>
                <div className="mt-6 flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setAddDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleAddProduct}>
                    <Save className="h-4 w-4 mr-2" />
                    Add Product
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

