"use client";
import { SelectedFilesProvider } from "@/context/SelectedFilesContext";
import Editor from "@/features/editor";
import SidebarHandled from "@/app/cliporacomponents/SidebarHandled";

export default function Home() {
	return (
		<SelectedFilesProvider>
			<Editor />
		</SelectedFilesProvider>
	)
}
