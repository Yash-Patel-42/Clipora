import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UploadIcon } from "lucide-react";
import { useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ADD_VIDEO, dispatch } from "@designcombo/events";
import { generateId } from "@designcombo/timeline";

export const Uploads = () => {
  const inputFileRef = useRef<HTMLInputElement>(null);

  const onInputFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Only handle video files
    if (!file.type.startsWith("video/")) {
      alert("Please upload a video file.");
      return;
    }
    const url = URL.createObjectURL(file);
    dispatch(ADD_VIDEO, {
      payload: {
        id: generateId(),
        details: {
          src: url,
          name: file.name,
        },
        metadata: {
          resourceId: url,
        },
      },
      options: {
        resourceId: "main",
      },
    });
    // Optionally clear the input so the same file can be uploaded again
    e.target.value = "";
  };
  return (
    <div className="flex-1 flex flex-col">
      <div className="text-sm flex-none text-text-primary font-medium h-12  flex items-center px-4">
        Your media
      </div>
      <input
        onChange={onInputFileChange}
        ref={inputFileRef}
        type="file"
        className="hidden"
        accept="image/*,audio/*,video/*"
      />
      <div className="px-4 py-2">
        <div>
          <Tabs defaultValue="projects" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="projects">Project</TabsTrigger>
              <TabsTrigger value="workspace">Workspace</TabsTrigger>
            </TabsList>
            <TabsContent value="projects">
              <Button
                onClick={() => {
                  inputFileRef.current?.click();
                }}
                className="flex gap-2 w-full"
                variant="secondary"
              >
                <UploadIcon size={16} /> Upload
              </Button>
              <div></div>
            </TabsContent>
            <TabsContent value="workspace">
              <Button
                onClick={() => {
                  inputFileRef.current?.click();
                }}
                className="flex gap-2 w-full"
                variant="secondary"
              >
                <UploadIcon size={16} /> Upload
              </Button>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <ScrollArea>
        <div className="px-4 masonry-sm"></div>
      </ScrollArea>
    </div>
  );
};
