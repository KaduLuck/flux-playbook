import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useProjectData } from "@/hooks/useProjectData";
import { ProjectData } from "@/hooks/useProjectData";

const JsonImport = () => {
  const { loadProjectData } = useProjectData();
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target?.result as string);
        loadProjectData(jsonData);
      } catch (error) {
        console.error("Error parsing JSON:", error);
        alert("Erro ao processar o arquivo JSON. Verifique o formato.");
      }
    };
    reader.readAsText(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileChange(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-4">
      <div 
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragging ? "border-primary bg-primary/10" : "border-gray-300"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".json"
          onChange={handleFileInput}
        />
        <div className="space-y-2">
          <p className="font-medium">
            Arraste e solte um arquivo JSON aqui ou clique para selecionar
          </p>
          <p className="text-sm text-muted-foreground">
            O arquivo deve seguir o formato do modelo-base.json
          </p>
          <Button variant="outline" size="sm">
            Selecionar Arquivo
          </Button>
        </div>
      </div>
      
      <div className="text-center text-sm text-muted-foreground">
        <p>Após importar, os cards serão exibidos no quadro de projetos</p>
      </div>
    </div>
  );
};

export default JsonImport;