"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { storesApi, Store, SavedProduct } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Tag, Info } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

export function StoreCatalogManager({ store }: { store: Store }) {
  const queryClient = useQueryClient();
  const catalog = store.storeCatalog || [];

  const [newItemName, setNewItemName] = useState("");
  const [newItemDesc, setNewItemDesc] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");

  const { mutate: addItem, isPending: isAdding } = useMutation({
    mutationFn: () => {
      const payload = {
        name: newItemName.trim(),
        description: newItemDesc.trim() || null,
        defaultPrice: newItemPrice.trim() || null,
      };
      // @ts-ignore - The API expects an array of products
      return storesApi.addToCatalog(store.id, [payload]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stores"] });
      queryClient.invalidateQueries({ queryKey: ["stores", store.id] });
      toast.success("Item added to catalog.");
      setNewItemName("");
      setNewItemDesc("");
      setNewItemPrice("");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to add item.");
    },
  });

  const { mutate: removeItem, isPending: isRemoving } = useMutation({
    mutationFn: (productId: string) => storesApi.removeFromCatalog(store.id, productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stores"] });
      queryClient.invalidateQueries({ queryKey: ["stores", store.id] });
      toast.success("Item removed from catalog.");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to remove item.");
    },
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    addItem();
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-500">
      <div>
        <h3 className="text-lg font-medium">Catalog Items</h3>
        <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
          <Info className="w-4 h-4 text-primary" />
          These are reusable names to speed up creating receipts. They don't track inventory.
        </p>
      </div>

      <div className="grid md:grid-cols-[1fr_300px] gap-8">
        <div className="space-y-4">
          <div className="rounded-xl overflow-hidden">
            <div className="font-medium text-sm flex justify-between mb-4">
              <span>Saved Items ({catalog.length})</span>
            </div>
            
            {catalog.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground flex flex-col items-center justify-center">
                <Tag className="w-8 h-8 mb-3 opacity-20" />
                <p>No items in catalog.</p>
                <p className="text-sm">Add some reusable items using the form.</p>
              </div>
            ) : (
              <ScrollArea className="h-auto">
                <div className="space-y-1">
                  {catalog.map((item: SavedProduct) => (
                    <div key={item.id} className="px-4 py-3 border border-transparent rounded-lg flex items-center justify-between group hover:bg-muted/30 transition-colors">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                          {item.defaultPrice && (
                            <span className="font-medium text-foreground/70">₵{item.defaultPrice}</span>
                          )}
                          {item.description && (
                            <span className="truncate max-w-[200px]">{item.description}</span>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => removeItem(item.id)}
                        disabled={isRemoving}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </div>

        <div>
          <form onSubmit={handleAdd} className="space-y-4 py-2 sticky top-6">
            <h4 className="font-medium flex items-center gap-2">
              <Plus className="w-4 h-4 text-primary" />
              Add New Item
            </h4>
            <Separator />
            
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Item Name *</label>
                <Input 
                  placeholder="e.g. Basic T-Shirt" 
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Default Price (Optional)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₵</span>
                  <Input 
                    placeholder="29.99" 
                    className="pl-7"
                    value={newItemPrice}
                    onChange={(e) => setNewItemPrice(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Description (Optional)</label>
                <Input 
                  placeholder="e.g. Black, Size L" 
                  value={newItemDesc}
                  onChange={(e) => setNewItemDesc(e.target.value)}
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full mt-2" 
              disabled={!newItemName.trim() || isAdding}
            >
              {isAdding ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Add to Catalog"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
