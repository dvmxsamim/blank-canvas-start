import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Music, Globe } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const AdminGenreLanguageForm = ({ onDataAdded }: { onDataAdded?: () => void }) => {
  const { toast } = useToast();
  const [genreLoading, setGenreLoading] = useState(false);
  const [languageLoading, setLanguageLoading] = useState(false);
  
  const [genreForm, setGenreForm] = useState({
    name: '',
    description: '',
  });

  const [languageForm, setLanguageForm] = useState({
    name: '',
    code: '',
  });

  const handleGenreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenreLoading(true);

    try {
      const { error } = await supabase
        .from('genres')
        .insert({
          name: genreForm.name,
          description: genreForm.description || null,
          slug: genreForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
        });

      if (error) throw error;

      toast({
        title: "Genre added successfully",
        description: `"${genreForm.name}" has been added to genres.`,
      });

      // Reset form
      setGenreForm({ name: '', description: '' });
      onDataAdded?.();
    } catch (error: any) {
      toast({
        title: "Error adding genre",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setGenreLoading(false);
    }
  };

  const handleLanguageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLanguageLoading(true);

    try {
      const { error } = await supabase
        .from('languages')
        .insert({
          name: languageForm.name,
          code: languageForm.code.toLowerCase()
        });

      if (error) throw error;

      toast({
        title: "Language added successfully",
        description: `"${languageForm.name}" has been added to languages.`,
      });

      // Reset form
      setLanguageForm({ name: '', code: '' });
      onDataAdded?.();
    } catch (error: any) {
      toast({
        title: "Error adding language",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLanguageLoading(false);
    }
  };

  return (
    <Tabs defaultValue="genres" className="w-full">
      <TabsList className="grid w-full grid-cols-2 bg-muted">
        <TabsTrigger value="genres">Add Genre</TabsTrigger>
        <TabsTrigger value="languages">Add Language</TabsTrigger>
      </TabsList>
      
      <TabsContent value="genres">
        <Card className="bg-gradient-card border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Music className="w-5 h-5" />
              Add New Genre
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleGenreSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="genreName">Genre Name *</Label>
                <Input
                  id="genreName"
                  value={genreForm.name}
                  onChange={(e) => setGenreForm({...genreForm, name: e.target.value})}
                  placeholder="e.g., Electronic, Jazz, Rock"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="genreDescription">Description</Label>
                <Textarea
                  id="genreDescription"
                  value={genreForm.description}
                  onChange={(e) => setGenreForm({...genreForm, description: e.target.value})}
                  placeholder="Describe this genre..."
                  rows={3}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-primary hover:opacity-90"
                disabled={genreLoading}
              >
                {genreLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                    Adding Genre...
                  </>
                ) : (
                  <>
                    <Music className="w-4 h-4 mr-2" />
                    Add Genre
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="languages">
        <Card className="bg-gradient-card border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Add New Language
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLanguageSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="languageName">Language Name *</Label>
                  <Input
                    id="languageName"
                    value={languageForm.name}
                    onChange={(e) => setLanguageForm({...languageForm, name: e.target.value})}
                    placeholder="e.g., English, Spanish, French"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="languageCode">Language Code *</Label>
                  <Input
                    id="languageCode"
                    value={languageForm.code}
                    onChange={(e) => setLanguageForm({...languageForm, code: e.target.value})}
                    placeholder="e.g., en, es, fr"
                    maxLength={5}
                    required
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-primary hover:opacity-90"
                disabled={languageLoading}
              >
                {languageLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                    Adding Language...
                  </>
                ) : (
                  <>
                    <Globe className="w-4 h-4 mr-2" />
                    Add Language
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default AdminGenreLanguageForm;