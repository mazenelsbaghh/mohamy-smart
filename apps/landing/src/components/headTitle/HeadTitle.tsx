
type THeadTitle = {
  title: string;
  span?: string;
  desc?: string;
  position: 'center' | 'start';
}

const HeadTitle = ({ title, span, desc, position }: THeadTitle) => {
  return (
    <div className={`head-title text-${position}`}>
      <h2>{title} <span> {span} </span></h2>
      <p>{desc}</p>
    </div>
  )
}

export default HeadTitle