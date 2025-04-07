import Image from "next/image";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <section className="hidden w-1/2 items-center justify-center bg-brand p-10 lg:flex xl:w-2/5">
        <div className="flex flex-col max-h-[800px] max-w-[600px] justify-center items-center space-y-12">
          <Image
            src="/assets/images/logo-white.png"
            alt="Brand logo"
            width={725}
            height={250}
            priority
            className="h-[70px] w-auto"
          />

          <div className="space-y-5 text-white text-center">
            <h1 className="h1">Manage your files the best way</h1>
          </div>
          <Image
            src="/assets/images/files.png"
            alt="Files"
            width={300}
            height={300}
            priority
            className="transition-all hover:rotate-2 hover:scale-105"
          />
        </div>
      </section>

      <section className="flex flex-1 flex-col items-center bg-brand-light p-4 py-10 lg:justify-center lg:p-10 lg:py-0">
        <div className="mb-16 lg:hidden">
          <Image
            src="/assets/images/logo-dark.png"
            alt="Brand logo"
            width={725}
            height={250}
            priority
            className="h-[70px] w-auto"
          />
        </div>

        {children}
      </section>
    </div>
  );
}
