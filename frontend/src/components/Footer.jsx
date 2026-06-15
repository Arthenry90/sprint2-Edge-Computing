function Footer() {
  return (
    <footer className="mt-auto py-6">
      <div className="w-[95%] max-w-[750px] mx-auto h-[60px] flex items-center justify-center border-2 border-[#1C9770] rounded-full px-8 bg-white">
        <p className="text-[#1C9770] font-semibold text-sm">
          &copy; {new Date().getFullYear()} Care Plus - Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}

export default Footer;