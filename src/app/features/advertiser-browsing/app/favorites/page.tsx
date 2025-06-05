'use client';

import { useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { useFavorites } from '@/context/favorites-context';
import { getAdvertisers, type Advertiser } from '@/lib/data';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, Plus, Edit, Trash2, FolderPlus, User } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';

export default function FavoritesPage() {
  const { user } = useAuth();
  const {
    favorites = [],
    groups = [],
    createGroup,
    deleteGroup,
    removeFromGroup,
    removeFavorite,
    renameGroup,
    addToGroup,
  } = useFavorites();
  const advertisers = getAdvertisers();
  const favoriteAdvertisers = advertisers.filter(
    advertiser => favorites && favorites.includes(advertiser.id),
  );

  const [newGroupName, setNewGroupName] = useState('');
  const [editedGroupName, setEditedGroupName] = useState('');
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);

  const handleCreateGroup = () => {
    if (newGroupName.trim() && createGroup) {
      createGroup(newGroupName.trim());
      setNewGroupName('');
    }
  };

  const handleRenameGroup = () => {
    if (editingGroupId && editedGroupName.trim() && renameGroup) {
      renameGroup(editingGroupId, editedGroupName.trim());
      setEditingGroupId(null);
      setEditedGroupName('');
    }
  };

  // If user is not logged in, show login prompt
  if (!user) {
    return (
      <div className="container mx-auto py-12 text-center">
        <div className="max-w-md mx-auto bg-card p-8 rounded-lg border">
          <User className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-2xl font-bold mb-4">Login Required</h1>
          <p className="text-muted-foreground mb-6">
            Please log in to view and manage your favorites.
          </p>
          <Button asChild>
            <Link href="/login">Login</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">My Favorites</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Group
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Group</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <Input
                placeholder="Group name"
                value={newGroupName}
                onChange={e => setNewGroupName(e.target.value)}
              />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleCreateGroup}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="all">
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Favorites</TabsTrigger>
          {groups &&
            groups.map(group => (
              <TabsTrigger key={group.id} value={group.id}>
                {group.name}
              </TabsTrigger>
            ))}
        </TabsList>

        <TabsContent value="all">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favoriteAdvertisers.length > 0 ? (
              favoriteAdvertisers.map(advertiser => (
                <AdvertiserCard
                  key={advertiser.id}
                  advertiser={advertiser}
                  onRemove={() => removeFavorite && removeFavorite(advertiser.id)}
                  onAddToGroup={groupId => addToGroup && addToGroup(advertiser.id, groupId)}
                  groups={groups || []}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">You haven't added any favorites yet.</p>
                <Button className="mt-4" asChild>
                  <Link href="/browse">Browse Advertisers</Link>
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        {groups &&
          groups.map(group => (
            <TabsContent key={group.id} value={group.id}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">{group.name}</h2>
                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        Rename
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Rename Group</DialogTitle>
                      </DialogHeader>
                      <div className="py-4">
                        <Input
                          placeholder="Group name"
                          defaultValue={group.name}
                          onChange={e => setEditedGroupName(e.target.value)}
                        />
                      </div>
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button
                          onClick={() => {
                            setEditingGroupId(group.id);
                            handleRenameGroup();
                          }}
                        >
                          Save
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteGroup && deleteGroup(group.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {group.advertisers && group.advertisers.length > 0 ? (
                  advertisers
                    .filter(advertiser => group.advertisers.includes(advertiser.id))
                    .map(advertiser => (
                      <AdvertiserCard
                        key={advertiser.id}
                        advertiser={advertiser}
                        onRemove={() => removeFromGroup && removeFromGroup(advertiser.id, group.id)}
                        onAddToGroup={groupId => addToGroup && addToGroup(advertiser.id, groupId)}
                        groups={groups || []}
                      />
                    ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <p className="text-muted-foreground">No advertisers in this group yet.</p>
                  </div>
                )}
              </div>
            </TabsContent>
          ))}
      </Tabs>
    </div>
  );
}

function AdvertiserCard({
  advertiser,
  onRemove,
  onAddToGroup,
  groups,
}: {
  advertiser: Advertiser;
  onRemove: () => void;
  onAddToGroup: (groupId: string) => void;
  groups: Array<{ id: string; name: string; advertisers?: string[] }>;
}) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-0">
        <div className="relative h-64">
          <div className="h-full bg-muted flex items-center justify-center">
            {advertiser.images && advertiser.images.length > 0 ? (
              <Image
                src={advertiser.images[0] || '/placeholder.svg'}
                alt={advertiser.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="text-muted-foreground">No Image</div>
            )}
          </div>
          <div className="absolute top-2 right-2 flex gap-1">
            <Badge variant="secondary" className="bg-black/70 text-white">
              {advertiser.rating} ★
            </Badge>
            {advertiser.isOnline && (
              <Badge variant="secondary" className="bg-green-500/90 text-white">
                Online
              </Badge>
            )}
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
            <h3 className="text-lg font-semibold text-white">{advertiser.name}</h3>
            <p className="text-sm text-white/80">{advertiser.distance} km away</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="h-12 overflow-auto">
          <div className="flex flex-wrap gap-1">
            {advertiser.tags &&
              advertiser.tags.map(tag => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between p-4 pt-0">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/advertiser/${advertiser.id}`}>
              <Heart className="h-4 w-4 mr-2" />
              Profile
            </Link>
          </Button>
          <Button variant="outline" size="sm">
            <MessageCircle className="h-4 w-4 mr-2" />
            Chat
          </Button>
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <FolderPlus className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {groups.map(group => (
                <DropdownMenuItem key={group.id} onClick={() => onAddToGroup(group.id)}>
                  {group.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="destructive" size="icon" onClick={onRemove}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
