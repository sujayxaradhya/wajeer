type logoProps = {
  className?: string;
  width?: number;
  height?: number;
};

const Logo = ({ className, width = 128, height = 42, ...props }: logoProps) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 314 45"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <path
      d="M33.6 0h11.2v44.8H32.256L22.4 39.872 12.544 44.8H0V0h11.2v32.96l11.2-5.568 11.2 5.568zm56.054 0 8.896 8.896V44.8h-11.2V33.6h-22.4v11.2h-11.2V8.896L62.646 0zM64.95 22.4h22.4v-8.832L85.046 11.2H67.254l-2.304 2.368zM107.5 0h44.8v35.968l-8.896 8.832h-27.008l-8.896-8.832V22.4h11.2v8.896l2.304 2.368h17.792l2.304-2.368V11.2h-33.6zm98.55 11.2h-33.6v5.632h22.4v11.2h-22.4v5.632h33.6V44.8h-44.8V0h44.8zm53.75 0h-33.6v5.632h22.4v11.2h-22.4v5.632h33.6V44.8H215V0h44.8zm53.75-2.304v15.872l-6.08 6.08 6.08 6.08V44.8h-11.2v-3.264l-7.936-7.936H279.95v11.2h-11.2V0h35.904zm-11.2 11.2v-6.528l-2.304-2.368H279.95v11.264h20.096z"
      fill="#1f9f4e"
    />
  </svg>
);
export default Logo;
