import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm as useFormQuery, useCreateForm, useUpdateForm } from "@/hooks/useForms";
import { useAnalysisEngines } from "@/hooks/useAnalysisEngines";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, X, Image as ImageIcon } from "lucide-react";
import type { FormCustomization } from "@/lib/types";
import { uploadFormImage, deleteFormImage, getStoragePublicUrl } from "@/lib/storage";

const formSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  is_active: z.boolean().default(true),
  customization_settings: z.object({
    background_image_url: z.string().optional().nullable(),
    primary_color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Cor inválida (use formato hexadecimal)").optional().or(z.literal("")),
    secondary_color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Cor inválida (use formato hexadecimal)").optional().or(z.literal("")),
    text_color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Cor inválida (use formato hexadecimal)").optional().or(z.literal("")),
    logo_url: z.string().optional().nullable(),
  }).optional().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

interface FormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formId?: string | null;
}

export function FormDialog({ open, onOpenChange, formId }: FormDialogProps) {
  const { toast } = useToast();
  const { data: existingForm } = useFormQuery(formId || null);
  const { data: analysisEngines } = useAnalysisEngines();
  const createForm = useCreateForm();
  const updateForm = useUpdateForm();
  
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [backgroundFile, setBackgroundFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [backgroundPreview, setBackgroundPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const backgroundInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      is_active: true,
      analysis_engine_id: null,
      customization_settings: {
        background_image_url: null,
        primary_color: undefined,
        secondary_color: undefined,
        text_color: undefined,
        logo_url: null,
      },
    },
  });

  const isActive = watch("is_active");
  const customization = watch("customization_settings");
  
  // Watch color values for synchronization
  const primaryColor = watch("customization_settings.primary_color") || "";
  const secondaryColor = watch("customization_settings.secondary_color") || "";
  const textColor = watch("customization_settings.text_color") || "";
  
  // Helper function to convert hex to color input format (ensures # prefix)
  const hexToColorInput = (hex: string): string => {
    if (!hex || hex === "") return "#000000";
    const normalized = hex.trim();
    return normalized.startsWith("#") ? normalized : `#${normalized}`;
  };
  
  // Helper function to normalize hex color (ensures # prefix and 6 digits)
  const normalizeHex = (color: string): string => {
    if (!color) return "";
    let normalized = color.trim().replace(/[^0-9A-Fa-f#]/g, "");
    if (!normalized.startsWith("#")) {
      normalized = `#${normalized}`;
    }
    // Remove # for processing
    const hexValue = normalized.slice(1);
    // Convert 3-digit hex to 6-digit
    if (hexValue.length === 3) {
      normalized = `#${hexValue[0]}${hexValue[0]}${hexValue[1]}${hexValue[1]}${hexValue[2]}${hexValue[2]}`;
    } else if (hexValue.length === 6) {
      normalized = `#${hexValue}`;
    } else {
      // If invalid length, return empty or default
      return "";
    }
    return normalized.toUpperCase();
  };

  useEffect(() => {
    if (existingForm) {
      reset({
        name: existingForm.name,
        description: existingForm.description || "",
        is_active: existingForm.is_active,
        customization_settings: existingForm.customization_settings || {
          background_image_url: null,
          primary_color: undefined,
          secondary_color: undefined,
          text_color: undefined,
          logo_url: null,
        },
      });
    } else {
      reset({
        name: "",
        description: "",
        is_active: true,
        customization_settings: {
          background_image_url: null,
          primary_color: undefined,
          secondary_color: undefined,
          text_color: undefined,
          logo_url: null,
        },
      });
    }
  }, [existingForm, reset, open]);

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBackgroundFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBackgroundFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setBackgroundPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    if (logoInputRef.current) {
      logoInputRef.current.value = "";
    }
    setValue("customization_settings.logo_url", null);
  };

  const removeBackground = () => {
    setBackgroundFile(null);
    setBackgroundPreview(null);
    if (backgroundInputRef.current) {
      backgroundInputRef.current.value = "";
    }
    setValue("customization_settings.background_image_url", null);
  };

  const onSubmit = async (data: FormValues) => {
    try {
      setIsUploading(true);
      
      // Determine form ID (use existing or create first)
      let currentFormId = formId;
      
      // If creating new form, create it first to get the ID
      if (!currentFormId) {
        const newForm = await createForm.mutateAsync({
          name: data.name,
          description: data.description,
          is_active: data.is_active,
          analysis_engine_id: data.analysis_engine_id && data.analysis_engine_id !== "" 
            ? data.analysis_engine_id 
            : null,
        });
        currentFormId = newForm.id;
      }

      // Upload images if files were selected
      let logoUrl = data.customization_settings?.logo_url || null;
      let backgroundImageUrl = data.customization_settings?.background_image_url || null;

      if (logoFile && currentFormId) {
        try {
          const result = await uploadFormImage(logoFile, currentFormId, "logo");
          logoUrl = result.url;
        } catch (error) {
          toast({
            title: "Erro ao fazer upload do logo",
            description: error instanceof Error ? error.message : "Não foi possível fazer upload do logo.",
            variant: "destructive",
          });
          setIsUploading(false);
          return;
        }
      }

      if (backgroundFile && currentFormId) {
        try {
          const result = await uploadFormImage(backgroundFile, currentFormId, "background");
          backgroundImageUrl = result.url;
        } catch (error) {
          toast({
            title: "Erro ao fazer upload da imagem de fundo",
            description: error instanceof Error ? error.message : "Não foi possível fazer upload da imagem de fundo.",
            variant: "destructive",
          });
          setIsUploading(false);
          return;
        }
      }

      // Clean up customization settings
      let cleanedCustomization: FormCustomization | null = null;
      const cleaned: FormCustomization = {};
      
      if (logoUrl) {
        cleaned.logo_url = logoUrl;
      }
      if (backgroundImageUrl) {
        cleaned.background_image_url = backgroundImageUrl;
      }
      if (data.customization_settings?.primary_color && data.customization_settings.primary_color !== "") {
        cleaned.primary_color = data.customization_settings.primary_color;
      }
      if (data.customization_settings?.secondary_color && data.customization_settings.secondary_color !== "") {
        cleaned.secondary_color = data.customization_settings.secondary_color;
      }
      if (data.customization_settings?.text_color && data.customization_settings.text_color !== "") {
        cleaned.text_color = data.customization_settings.text_color;
      }
      
      if (Object.keys(cleaned).length > 0) {
        cleanedCustomization = cleaned;
      }

      const submitData = {
        name: data.name,
        description: data.description,
        is_active: data.is_active,
        customization_settings: cleanedCustomization,
      };

      if (formId) {
        await updateForm.mutateAsync({ id: formId, data: submitData });
        toast({
          title: "Formulário atualizado",
          description: "O formulário foi atualizado com sucesso.",
        });
      } else {
        toast({
          title: "Formulário criado",
          description: "O formulário foi criado com sucesso.",
        });
      }
      
      setIsUploading(false);
      onOpenChange(false);
    } catch (error) {
      setIsUploading(false);
      toast({
        title: "Erro",
        description: formId
          ? "Não foi possível atualizar o formulário."
          : "Não foi possível criar o formulário.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{formId ? "Editar Formulário" : "Novo Formulário"}</DialogTitle>
          <DialogDescription>
            {formId
              ? "Atualize as informações do formulário."
              : "Crie um novo formulário de diagnóstico estratégico."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic">Informações Básicas</TabsTrigger>
              <TabsTrigger value="customization">Personalização</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome *</Label>
                <Input id="name" {...register("name")} placeholder="Ex: Diagnóstico Estratégico 3F" />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  {...register("description")}
                  placeholder="Descrição do formulário..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="analysis_engine_id">Motor de Análise</Label>
                <Select
                  value={watch("analysis_engine_id") || ""}
                  onValueChange={(value) => 
                    setValue("analysis_engine_id", value === "" ? null : value, { shouldValidate: true })
                  }
                >
                  <SelectTrigger id="analysis_engine_id">
                    <SelectValue placeholder="Selecione um motor de análise (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Nenhum (usar padrão)</SelectItem>
                    {analysisEngines?.map((engine) => (
                      <SelectItem key={engine.id} value={engine.id}>
                        {engine.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Selecione um motor de análise com pilares personalizados. Se não selecionar, será usado o padrão.
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="is_active">Formulário ativo</Label>
                  <p className="text-sm text-muted-foreground">
                    Apenas formulários ativos estão disponíveis para uso
                  </p>
                </div>
                <Switch
                  id="is_active"
                  checked={isActive}
                  onCheckedChange={(checked) => setValue("is_active", checked)}
                />
              </div>
            </TabsContent>

            <TabsContent value="customization" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label className="text-base font-semibold">Cores</Label>
                  <p className="text-sm text-muted-foreground mb-4">
                    Personalize as cores do formulário (formato hexadecimal: #000000)
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="primary_color">Cor Primária</Label>
                    <div className="flex gap-2">
                      <Input
                        id="primary_color"
                        type="color"
                        value={hexToColorInput(primaryColor)}
                        onChange={(e) => {
                          const newColor = normalizeHex(e.target.value);
                          setValue("customization_settings.primary_color", newColor, { shouldValidate: true });
                        }}
                        className="w-16 h-10 p-1 cursor-pointer"
                      />
                      <Input
                        type="text"
                        placeholder="#1976d2"
                        value={primaryColor}
                        onChange={(e) => {
                          const newColor = normalizeHex(e.target.value);
                          setValue("customization_settings.primary_color", newColor, { shouldValidate: true });
                        }}
                      />
                    </div>
                    {errors.customization_settings?.primary_color && (
                      <p className="text-sm text-destructive">
                        {errors.customization_settings.primary_color.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="secondary_color">Cor Secundária</Label>
                    <div className="flex gap-2">
                      <Input
                        id="secondary_color"
                        type="color"
                        value={hexToColorInput(secondaryColor)}
                        onChange={(e) => {
                          const newColor = normalizeHex(e.target.value);
                          setValue("customization_settings.secondary_color", newColor, { shouldValidate: true });
                        }}
                        className="w-16 h-10 p-1 cursor-pointer"
                      />
                      <Input
                        type="text"
                        placeholder="#424242"
                        value={secondaryColor}
                        onChange={(e) => {
                          const newColor = normalizeHex(e.target.value);
                          setValue("customization_settings.secondary_color", newColor, { shouldValidate: true });
                        }}
                      />
                    </div>
                    {errors.customization_settings?.secondary_color && (
                      <p className="text-sm text-destructive">
                        {errors.customization_settings.secondary_color.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="text_color">Cor do Texto</Label>
                    <div className="flex gap-2">
                      <Input
                        id="text_color"
                        type="color"
                        value={hexToColorInput(textColor)}
                        onChange={(e) => {
                          const newColor = normalizeHex(e.target.value);
                          setValue("customization_settings.text_color", newColor, { shouldValidate: true });
                        }}
                        className="w-16 h-10 p-1 cursor-pointer"
                      />
                      <Input
                        type="text"
                        placeholder="#1a1a1a"
                        value={textColor}
                        onChange={(e) => {
                          const newColor = normalizeHex(e.target.value);
                          setValue("customization_settings.text_color", newColor, { shouldValidate: true });
                        }}
                      />
                    </div>
                    {errors.customization_settings?.text_color && (
                      <p className="text-sm text-destructive">
                        {errors.customization_settings.text_color.message}
                      </p>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Logo</Label>
                  <div className="space-y-3">
                    {logoPreview && (
                      <div className="relative inline-block">
                        <img
                          src={logoPreview}
                          alt="Logo preview"
                          className="h-20 w-auto object-contain border rounded-lg p-2 bg-muted"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                          onClick={removeLogo}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    <div>
                      <Input
                        ref={logoInputRef}
                        id="logo_file"
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                        onChange={handleLogoFileChange}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => logoInputRef.current?.click()}
                        className="w-full"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        {logoPreview ? "Alterar Logo" : "Enviar Logo"}
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Formatos aceitos: JPEG, PNG, WebP, GIF. Tamanho máximo: 5MB
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Imagem de Fundo</Label>
                  <div className="space-y-3">
                    {backgroundPreview && (
                      <div className="relative inline-block max-w-full">
                        <img
                          src={backgroundPreview}
                          alt="Background preview"
                          className="h-32 w-auto object-cover border rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                          onClick={removeBackground}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    <div>
                      <Input
                        ref={backgroundInputRef}
                        id="background_file"
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                        onChange={handleBackgroundFileChange}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => backgroundInputRef.current?.click()}
                        className="w-full"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        {backgroundPreview ? "Alterar Imagem de Fundo" : "Enviar Imagem de Fundo"}
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Formatos aceitos: JPEG, PNG, WebP, GIF. Tamanho máximo: 5MB
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createForm.isPending || updateForm.isPending || isUploading}>
              {(createForm.isPending || updateForm.isPending || isUploading) && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              {isUploading ? "Enviando..." : formId ? "Atualizar" : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

