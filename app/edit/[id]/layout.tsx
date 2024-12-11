import localFont from "next/font/local";

const geistSans = localFont({
    src: "../../fonts/GeistVF.woff",
    variable: "--font-geist-sans",
    weight: "100 900",
});

const geistMono = localFont({
    src: "../../fonts/GeistMonoVF.woff",
    variable: "--font-geist-mono",
    weight: "100 900",
});

export const metadata = {
    title: '編輯圖片'
};

export default function EditLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className={`${geistSans.variable} ${geistMono.variable} antialiased w-full max-w-full overflow-x-hidden min-h-screen`}>
            {children}
        </div>
    );
}
