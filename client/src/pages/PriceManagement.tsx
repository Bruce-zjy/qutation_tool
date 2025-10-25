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
import { ArrowLeft, Plus, Search, Edit, Trash2, Save } from "lucide-react";
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

  const searchMutation = trpc.products.search.useQuery(
    { query: searchQuery, limit: 50 },
    { enabled: searchQuery.length > 0 }
  );

  const allProductsQuery = trpc.products.search.useQuery(
    { query: "", limit: 100 },
    { enabled: searchQuery.length === 0 }
  );

  const products = searchQuery.length > 0 ? searchMutation.data : allProductsQuery.data;

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
                  onChange={(e) => setSearchQuery(e.target.value)}
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
          </CardContent>
        </Card>
      </main>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>Update product pricing information</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="product">Product Name</Label>
              <Input
                id="product"
                value={formData.product}
                onChange={(e) => setFormData({ ...formData, product: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pack">Pack</Label>
              <Input
                id="pack"
                value={formData.pack}
                onChange={(e) => setFormData({ ...formData, pack: e.target.value })}
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cutOff">Cut-Off</Label>
              <Input
                id="cutOff"
                value={formData.cutOff}
                onChange={(e) => setFormData({ ...formData, cutOff: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="baseUsdFinished">Finished USD</Label>
              <Input
                id="baseUsdFinished"
                type="number"
                step="0.0001"
                value={formData.baseUsdFinished}
                onChange={(e) => setFormData({ ...formData, baseUsdFinished: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="baseRmbFinished">Finished RMB</Label>
              <Input
                id="baseRmbFinished"
                type="number"
                step="0.01"
                value={formData.baseRmbFinished}
                onChange={(e) => setFormData({ ...formData, baseRmbFinished: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="baseUsdBulk">Bulk USD</Label>
              <Input
                id="baseUsdBulk"
                type="number"
                step="0.0001"
                value={formData.baseUsdBulk}
                onChange={(e) => setFormData({ ...formData, baseUsdBulk: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="baseRmbBulk">Bulk RMB</Label>
              <Input
                id="baseRmbBulk"
                type="number"
                step="0.01"
                value={formData.baseRmbBulk}
                onChange={(e) => setFormData({ ...formData, baseRmbBulk: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
            <DialogDescription>Enter product pricing information</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-product">Product Name</Label>
              <Input
                id="new-product"
                value={formData.product}
                onChange={(e) => setFormData({ ...formData, product: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-pack">Pack</Label>
              <Input
                id="new-pack"
                value={formData.pack}
                onChange={(e) => setFormData({ ...formData, pack: e.target.value })}
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="new-description">Description</Label>
              <Input
                id="new-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-cutOff">Cut-Off</Label>
              <Input
                id="new-cutOff"
                value={formData.cutOff}
                onChange={(e) => setFormData({ ...formData, cutOff: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-baseUsdFinished">Finished USD</Label>
              <Input
                id="new-baseUsdFinished"
                type="number"
                step="0.0001"
                value={formData.baseUsdFinished}
                onChange={(e) => setFormData({ ...formData, baseUsdFinished: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-baseRmbFinished">Finished RMB</Label>
              <Input
                id="new-baseRmbFinished"
                type="number"
                step="0.01"
                value={formData.baseRmbFinished}
                onChange={(e) => setFormData({ ...formData, baseRmbFinished: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-baseUsdBulk">Bulk USD</Label>
              <Input
                id="new-baseUsdBulk"
                type="number"
                step="0.0001"
                value={formData.baseUsdBulk}
                onChange={(e) => setFormData({ ...formData, baseUsdBulk: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-baseRmbBulk">Bulk RMB</Label>
              <Input
                id="new-baseRmbBulk"
                type="number"
                step="0.01"
                value={formData.baseRmbBulk}
                onChange={(e) => setFormData({ ...formData, baseRmbBulk: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddProduct}>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

