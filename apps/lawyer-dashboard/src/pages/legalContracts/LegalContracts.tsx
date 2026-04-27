import { CustomButton, Container, CustomTable } from'@mohamy/shared-ui';

import HeadTitle from'../../components/headTitle/HeadTitle'
import SubTitle from'../../components/subTitle/SubTitle'
// import InputSelect from'../../components/ui/inputs/InputSelect'

import { FiPlus } from'react-icons/fi'

import FormModal from'../../components/ui/form/FormModal'
import { useDisclosure } from'@heroui/react'
import AddNewContractsForm from'../../components/forms/AddNewContractsForm'

const LegalContracts = () => {
 const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
 const contracts = [
 {
 key:"1",
 contractType:"عقد إيجار",
 clientName:"محمد احمد",
 createdAt:"2024-01-15",
 status:"مفتوحة",
 },
 {
 key:"2",
 contractType:"عقد بيع",
 clientName:"يوسف احمد",
 createdAt:"2024-02-01",
 status:"مرقوض",
 },
 {
 key:"3",
 contractType:"عقد عمل",
 clientName:"محمود علي",
 createdAt:"2024-02-20",
 status:"معلقة",
 },
 {
 key:"4",
 contractType:"عقد شراكة",
 clientName:"سارة حسن",
 createdAt:"2024-03-05",
 status:"مفتوحة",
 },
 {
 key:"5",
 contractType:"عقد إيجار",
 clientName:"أحمد فؤاد",
 createdAt:"2024-03-18",
 status:"مرقوض",
 },
 {
 key:"6",
 contractType:"عقد بيع",
 clientName:"ليلى عمر",
 createdAt:"2024-04-02",
 status:"مفتوحة",
 },
 {
 key:"7",
 contractType:"عقد عمل",
 clientName:"كريم سمير",
 createdAt:"2024-04-15",
 status:"معلقة",
 },
 {
 key:"8",
 contractType:"عقد شراكة",
 clientName:"نور محمد",
 createdAt:"2024-05-01",
 status:"مفتوحة",
 },
 ];

 const columns = [
 { key:"contractType", label:"نوع العقد" },
 { key:"clientName", label:"اسم الموكل" },
 { key:"createdAt", label:"تاريخ الإنشاء" },
 { key:"status", label:"الحالة" },
 ];

 return (
 <section className='legal-contracts'>
 <Container>
 <HeadTitle title='العقود القانونية' />
 <SubTitle
 title='تقارير تفصيلية :'
 components={
 <div className='sub-title-component'>
 {/* <div className='sub-title-component-select'>
 <InputSelect
 label='الحاله'
 data={['مفتوحة','قيد المراجعة','مرفوض']}
 radius='full'
 />
 </div> */}
 <div className="">
 <CustomButton
 type='button'
 text='إضافة العقد جديد'
 startContent={<FiPlus />}
 color='primary'
 radius='full'
 size='lg'
 onClick={onOpen}
 />
 </div>
 </div>
 }
 />

 <div className="w-full m-8">
 <CustomTable
 columns={columns}
 data={contracts}
 />
 </div>
 </Container>
 <FormModal isOpen={isOpen} onOpenChange={onOpenChange} title='إضافة عقد جديد' size='lg'>
 <AddNewContractsForm onClose={onClose} />
 </FormModal>
 </section>
 )
}

export default LegalContracts