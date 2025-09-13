import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Stethoscope, Plus, Edit2, Trash2, Pill, Calendar, Clock, LogOut, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface Medication {
  id: string;
  medication_name: string;
  dosage?: string;
  frequency?: string;
  start_date?: string;
  end_date?: string;
  notes?: string;
  is_prescribed: boolean;
  created_at: string;
}

export default function Medications() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMed, setEditingMed] = useState<Medication | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    medication_name: '',
    dosage: '',
    frequency: '',
    start_date: '',
    end_date: '',
    notes: '',
    is_prescribed: false
  });

  useEffect(() => {
    if (user) {
      fetchMedications();
    }
  }, [user]);

  const fetchMedications = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('medications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching medications:', error);
      return;
    }

    setMedications(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.medication_name.trim()) return;

    setIsLoading(true);

    try {
      const medData = {
        ...formData,
        user_id: user.id,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null
      };

      if (editingMed) {
        const { error } = await supabase
          .from('medications')
          .update(medData)
          .eq('id', editingMed.id);

        if (error) throw error;

        toast({
          title: "Medication updated",
          description: "Your medication has been updated successfully.",
        });
      } else {
        const { error } = await supabase
          .from('medications')
          .insert(medData);

        if (error) throw error;

        toast({
          title: "Medication added",
          description: "Your medication has been added successfully.",
        });
      }

      resetForm();
      fetchMedications();
    } catch (error) {
      console.error('Error saving medication:', error);
      toast({
        title: "Error",
        description: "Failed to save medication. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (medication: Medication) => {
    setEditingMed(medication);
    setFormData({
      medication_name: medication.medication_name,
      dosage: medication.dosage || '',
      frequency: medication.frequency || '',
      start_date: medication.start_date || '',
      end_date: medication.end_date || '',
      notes: medication.notes || '',
      is_prescribed: medication.is_prescribed
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (medicationId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('medications')
        .delete()
        .eq('id', medicationId);

      if (error) throw error;

      toast({
        title: "Medication deleted",
        description: "Your medication has been removed.",
      });

      fetchMedications();
    } catch (error) {
      console.error('Error deleting medication:', error);
      toast({
        title: "Error",
        description: "Failed to delete medication. Please try again.",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      medication_name: '',
      dosage: '',
      frequency: '',
      start_date: '',
      end_date: '',
      notes: '',
      is_prescribed: false
    });
    setEditingMed(null);
    setIsDialogOpen(false);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">
                My{' '}
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Medications
                </span>
              </h2>
              <p className="text-muted-foreground">
                Track all your current medications, supplements, and treatments
              </p>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => resetForm()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Medication
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>
                    {editingMed ? 'Edit Medication' : 'Add New Medication'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingMed ? 'Update your medication details' : 'Add a medication, supplement, or treatment you\'re currently taking'}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="medication_name">Medication Name *</Label>
                    <Input
                      id="medication_name"
                      value={formData.medication_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, medication_name: e.target.value }))}
                      placeholder="e.g., Aspirin, Vitamin D, etc."
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="dosage">Dosage</Label>
                      <Input
                        id="dosage"
                        value={formData.dosage}
                        onChange={(e) => setFormData(prev => ({ ...prev, dosage: e.target.value }))}
                        placeholder="e.g., 100mg"
                      />
                    </div>
                    <div>
                      <Label htmlFor="frequency">Frequency</Label>
                      <Input
                        id="frequency"
                        value={formData.frequency}
                        onChange={(e) => setFormData(prev => ({ ...prev, frequency: e.target.value }))}
                        placeholder="e.g., Twice daily"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="start_date">Start Date</Label>
                      <Input
                        id="start_date"
                        type="date"
                        value={formData.start_date}
                        onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="end_date">End Date (Optional)</Label>
                      <Input
                        id="end_date"
                        type="date"
                        value={formData.end_date}
                        onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_prescribed"
                      checked={formData.is_prescribed}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_prescribed: checked }))}
                    />
                    <Label htmlFor="is_prescribed">Prescribed by doctor</Label>
                  </div>

                  <div>
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Any additional notes about this medication..."
                      className="min-h-[80px]"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button type="submit" disabled={isLoading} className="flex-1">
                      {isLoading ? 'Saving...' : (editingMed ? 'Update' : 'Add')} Medication
                    </Button>
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Important Notice */}
          <Card className="mb-6 border-destructive/20 bg-destructive/5">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                <div>
                  <h3 className="font-semibold text-destructive mb-1">Important Notice</h3>
                  <p className="text-sm text-muted-foreground">
                    This medication tracker is for personal record-keeping only. Always consult with your healthcare 
                    provider before starting, stopping, or changing any medication. Do not use this app as a substitute 
                    for professional medical advice.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Medications List */}
          {medications.length === 0 ? (
            <Card>
              <CardContent className="pt-12 pb-12 text-center">
                <Pill className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No medications added yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start tracking your medications, supplements, and treatments
                </p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Medication
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {medications.map((medication) => (
                <Card key={medication.id} className="border-border/50">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Pill className="h-5 w-5 text-primary" />
                          {medication.medication_name}
                        </CardTitle>
                        <div className="flex gap-2 mt-2">
                          {medication.is_prescribed && (
                            <Badge variant="secondary">Prescribed</Badge>
                          )}
                          {!medication.is_prescribed && (
                            <Badge variant="outline">Self-medication</Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(medication)}>
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDelete(medication.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      {medication.dosage && (
                        <div>
                          <span className="text-muted-foreground">Dosage:</span>
                          <p className="font-medium">{medication.dosage}</p>
                        </div>
                      )}
                      {medication.frequency && (
                        <div>
                          <span className="text-muted-foreground">Frequency:</span>
                          <p className="font-medium">{medication.frequency}</p>
                        </div>
                      )}
                      {medication.start_date && (
                        <div>
                          <span className="text-muted-foreground">Started:</span>
                          <p className="font-medium">
                            {format(new Date(medication.start_date), 'MMM d, yyyy')}
                          </p>
                        </div>
                      )}
                      {medication.end_date && (
                        <div>
                          <span className="text-muted-foreground">Until:</span>
                          <p className="font-medium">
                            {format(new Date(medication.end_date), 'MMM d, yyyy')}
                          </p>
                        </div>
                      )}
                    </div>
                    {medication.notes && (
                      <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                        <span className="text-muted-foreground text-sm">Notes:</span>
                        <p className="text-sm mt-1">{medication.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}