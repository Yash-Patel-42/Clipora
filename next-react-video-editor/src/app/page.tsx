"use client";
import { SelectedFilesProvider } from "@/context/SelectedFilesContext";
import Editor from "@/features/editor";

export default function Home() {
	return (
		<SelectedFilesProvider>
			<Editor />
		</SelectedFilesProvider>
	)
}
