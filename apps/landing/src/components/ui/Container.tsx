
type TContainerProps = {
    children: React.ReactNode;
}

const Container = ({ children }: TContainerProps) => {
    return (
        <div className="px-5 md:px-14 lg:px-24">{children}</div>
    );
};

export default Container;