import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Link, useLocation } from "wouter";
import { ArrowLeft, Plus, Search, Trash2, Save } from "lucide-react";
import { APP_TITLE } from "@/const";

interface QuotationItem {
  product: string;
  description?: string;
  specimen?: string;
  format?: string;
  pack?: string;
  productType: 'finished' | 'bulk'; // Type of product: finished or bulk
  quantity: number;
  baseUsdFinished: number;
  baseRmbFinished: number;
  baseUsdBulk?: number;
  baseRmbBulk?: number;
  markupPercentage: number;
  finalUsdFinished: number;
  finalRmbFinished: number;
  finalUsdBulk?: number;
  finalRmbBulk?: number;
}

export default function NewQuotation() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  
  const [customerName, setCustomerName] = useState("");
  const [exchangeRate, setExchangeRate] = useState("7.1");
  const [taxRate, setTaxRate] = useState("0.13");
  const [items, setItems] = useState<QuotationItem[]>([]);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  
  const searchMutation = trpc.products.search.useQuery(
    { query: searchQuery, limit: 10 },
    { enabled: searchQuery.length > 0 && searchDialogOpen }
  );
  
  const createMutation = trpc.quotations.create.useMutation({
    onSuccess: (data) => {
      toast.success("Quotation created successfully!");
      setLocation(`/quotations/${data.id}`);
    },
    onError: (error) => {
      toast.error(`Failed to create quotation: ${error.message}`);
    }
  });

  const calculatePrices = (baseUsd: number, markup: number) => {
    const rate = parseFloat(exchangeRate);
    const tax = parseFloat(taxRate);
    const finalUsd = baseUsd * (1 + markup);
    const finalRmb = finalUsd * rate * (1 + tax);
    return { finalUsd, finalRmb };
  };

  const addProductToQuotation = (product: any, productType: 'finished' | 'bulk') => {
    const markup = 0.10; // Default 10% markup
    
    const finishedPrices = calculatePrices(product.baseUsdFinished, markup);
    const bulkPrices = product.baseUsdBulk > 0 ? calculatePrices(product.baseUsdBulk, markup) : null;
    
    const newItem: QuotationItem = {
      product: product.product,
      description: product.description,
      specimen: product.cutOff, // Using cutOff as specimen for now
      format: product.pack,
      pack: product.pack,
      productType,
      quantity: 1,
      baseUsdFinished: product.baseUsdFinished,
      baseRmbFinished: product.baseRmbFinished,
      baseUsdBulk: product.baseUsdBulk > 0 ? product.baseUsdBulk : undefined,
      baseRmbBulk: product.baseRmbBulk > 0 ? product.baseRmbBulk : undefined,
      markupPercentage: markup,
      finalUsdFinished: finishedPrices.finalUsd,
      finalRmbFinished: finishedPrices.finalRmb,
      finalUsdBulk: bulkPrices?.finalUsd,
      finalRmbBulk: bulkPrices?.finalRmb,
    };
    
    setItems([...items, newItem]);
    setSearchDialogOpen(false);
    setSearchQuery("");
    toast.success(`Product added to quotation (${productType})`);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
    toast.info("Product removed from quotation");
  };

  const updateItemQuantity = (index: number, quantity: number) => {
    const newItems = [...items];
    newItems[index].quantity = quantity;
    setItems(newItems);
  };

  const updateItemMarkup = (index: number, markup: number) => {
    const newItems = [...items];
    const item = newItems[index];
    item.markupPercentage = markup;
    
    const finishedPrices = calculatePrices(item.baseUsdFinished, markup);
    item.finalUsdFinished = finishedPrices.finalUsd;
    item.finalRmbFinished = finishedPrices.finalRmb;
    
    if (item.baseUsdBulk) {
      const bulkPrices = calculatePrices(item.baseUsdBulk, markup);
      item.finalUsdBulk = bulkPrices.finalUsd;
      item.finalRmbBulk = bulkPrices.finalRmb;
    }
    
    setItems(newItems);
  };

  const updateItemPrice = (index: number, currency: 'usd' | 'rmb', value: number) => {
    const newItems = [...items];
    const item = newItems[index];
    
    if (item.productType === 'finished') {
      if (currency === 'usd') {
        item.finalUsdFinished = value;
        // Auto-calculate RMB based on USD
        const rate = parseFloat(exchangeRate);
        const tax = parseFloat(taxRate);
        item.finalRmbFinished = value * rate * (1 + tax);
      } else {
        item.finalRmbFinished = value;
      }
    } else {
      if (currency === 'usd') {
        item.finalUsdBulk = value;
        // Auto-calculate RMB based on USD
        const rate = parseFloat(exchangeRate);
        const tax = parseFloat(taxRate);
        item.finalRmbBulk = value * rate * (1 + tax);
      } else {
        item.finalRmbBulk = value;
      }
    }
    
    setItems(newItems);
  };

  const handleSaveQuotation = () => {
    if (items.length === 0) {
      toast.error("Please add at least one product to the quotation");
      return;
    }

    createMutation.mutate({
      customerName: customerName || undefined,
      exchangeRate,
      taxRate,
      items: items.map(item => ({
        product: item.product,
        description: item.description,
        specimen: item.specimen,
        format: item.format,
        pack: item.pack,
        quantity: item.quantity,
        baseUsdFinished: item.baseUsdFinished.toString(),
        baseRmbFinished: item.baseRmbFinished.toString(),
        baseUsdBulk: item.baseUsdBulk?.toString(),
        baseRmbBulk: item.baseRmbBulk?.toString(),
        markupPercentage: item.markupPercentage.toString(),
        finalUsdFinished: item.finalUsdFinished.toString(),
        finalRmbFinished: item.finalRmbFinished.toString(),
        finalUsdBulk: item.finalUsdBulk?.toString(),
        finalRmbBulk: item.finalRmbBulk?.toString(),
      }))
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/quotations">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold">{APP_TITLE}</h1>
          </div>
          <span className="text-sm text-gray-600">Welcome, {user?.name || user?.email}</span>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Create New Quotation</h2>
          <p className="text-gray-600">Search for products and build your quotation</p>
        </div>

        <div className="grid gap-6">
          {/* Quotation Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Quotation Information</CardTitle>
              <CardDescription>Basic information about this quotation</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              <div>
                <Label htmlFor="customerName">Customer Name (Optional)</Label>
                <Input
                  id="customerName"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter customer name"
                />
              </div>
              <div>
                <Label htmlFor="exchangeRate">Exchange Rate (USD to RMB)</Label>
                <Input
                  id="exchangeRate"
                  type="number"
                  step="0.01"
                  value={exchangeRate}
                  onChange={(e) => setExchangeRate(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="taxRate">Tax Rate</Label>
                <Input
                  id="taxRate"
                  type="number"
                  step="0.01"
                  value={taxRate}
                  onChange={(e) => setTaxRate(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Products Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Products</CardTitle>
                  <CardDescription>Add products to your quotation</CardDescription>
                </div>
                <Button onClick={() => setSearchDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {items.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p>No products added yet. Click "Add Product" to get started.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Pack</TableHead>
                        <TableHead className="text-right">Price USD</TableHead>
                        <TableHead className="text-right">Price RMB</TableHead>
                        <TableHead className="w-16"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item, index) => {
                        const displayUsd = item.productType === 'finished' ? item.finalUsdFinished : item.finalUsdBulk;
                        const displayRmb = item.productType === 'finished' ? item.finalRmbFinished : item.finalRmbBulk;
                        return (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{item.product}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              item.productType === 'finished' 
                                ? 'bg-blue-100 text-blue-700' 
                                : 'bg-green-100 text-green-700'
                            }`}>
                              {item.productType === 'finished' ? 'Finished' : 'Bulk'}
                            </span>
                          </TableCell>
                          <TableCell>{item.pack}</TableCell>
                          <TableCell className="text-right">
                            <Input
                              type="number"
                              step="0.0001"
                              value={displayUsd?.toFixed(4) || ''}
                              onChange={(e) => updateItemPrice(index, 'usd', parseFloat(e.target.value) || 0)}
                              className="w-28 text-right"
                              placeholder="0.0000"
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            <Input
                              type="number"
                              step="0.01"
                              value={displayRmb?.toFixed(2) || ''}
                              onChange={(e) => updateItemPrice(index, 'rmb', parseFloat(e.target.value) || 0)}
                              className="w-28 text-right"
                              placeholder="0.00"
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeItem(index)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4">
            <Link href="/quotations">
              <Button variant="outline">Cancel</Button>
            </Link>
            <Button
              onClick={handleSaveQuotation}
              disabled={createMutation.isPending || items.length === 0}
            >
              <Save className="h-4 w-4 mr-2" />
              {createMutation.isPending ? "Saving..." : "Save Quotation"}
            </Button>
          </div>
        </div>
      </main>

      {/* Product Search Dialog */}
      <Dialog open={searchDialogOpen} onOpenChange={setSearchDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Search Products</DialogTitle>
            <DialogDescription>
              Search for products by name, description, or keywords
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter product name or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchQuery) {
                    searchMutation.refetch();
                  }
                }}
              />
              <Button onClick={() => searchMutation.refetch()} disabled={!searchQuery}>
                <Search className="h-4 w-4" />
              </Button>
            </div>

            {searchMutation.isLoading && (
              <div className="text-center py-8 text-gray-500">Searching...</div>
            )}

            {searchMutation.data && searchMutation.data.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No products found. Try a different search term.
              </div>
            )}

            {searchMutation.data && searchMutation.data.length > 0 && (
              <div className="space-y-2">
                {searchMutation.data.map((product: any, index: number) => (
                  <Card key={index} className="hover:bg-gray-50">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg">{product.product}</h4>
                          <p className="text-sm text-gray-700 font-medium mt-1">{product.description}</p>
                          <div className="flex gap-4 mt-2 text-sm text-gray-500">
                            <span><span className="font-medium">Pack:</span> {product.pack}</span>
                            <span><span className="font-medium">Cut-Off:</span> {product.cutOff}</span>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <div className="text-center">
                            <div className="text-sm font-medium mb-1">Finished</div>
                            <div className="text-sm text-gray-600">${product.baseUsdFinished.toFixed(4)}</div>
                            <div className="text-sm text-gray-600 mb-2">¥{product.baseRmbFinished.toFixed(2)}</div>
                            <Button 
                              size="sm" 
                              onClick={() => addProductToQuotation(product, 'finished')}
                              className="w-full"
                            >
                              Add Finished
                            </Button>
                          </div>
                          {product.baseUsdBulk > 0 && (
                            <div className="text-center">
                              <div className="text-sm font-medium mb-1">Bulk</div>
                              <div className="text-sm text-gray-600">${product.baseUsdBulk.toFixed(4)}</div>
                              <div className="text-sm text-gray-600 mb-2">¥{product.baseRmbBulk.toFixed(2)}</div>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => addProductToQuotation(product, 'bulk')}
                                className="w-full"
                              >
                                Add Bulk
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

