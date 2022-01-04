import clusterPanelStyles from '@/pages/SystemSetting/ClustersPanel/index.less';
import ClustersSearchBar from '@/pages/SystemSetting/ClustersPanel/ClustersSearchBar';
import { createContext, useEffect, useState } from 'react';
import ClustersTable from '@/pages/SystemSetting/ClustersPanel/ClustersTable';
import CreatedOrUpdatedClusterModal from '@/pages/SystemSetting/ClustersPanel/CreatedOrUpdatedClusterModal';
import type { ClusterType } from '@/services/systemSetting';
import { useModel } from '@@/plugin-model/useModel';
type ClustersPanelProps = {};
type ClustersPanelContextType = {
  onChangeVisible?: (flag: boolean) => void;
  onChangeIsEditor?: (flag: boolean) => void;
  onChangeCurrentCluster?: (param: ClusterType | undefined) => void;
};
export const ClustersPanelContext = createContext<ClustersPanelContextType>({});
const ClustersPanel = (props: ClustersPanelProps) => {
  const [visible, setVisible] = useState<boolean>(false);
  const [isEditor, setIsEditor] = useState<boolean>(false);
  const [current, setCurrent] = useState<ClusterType | undefined>(undefined);
  const { doGetClustersList } = useModel('systemSetting');

  useEffect(() => {
    doGetClustersList();
  }, []);
  return (
    <div className={clusterPanelStyles.clusterPanelMain}>
      <ClustersPanelContext.Provider
        value={{
          onChangeVisible: (flag: boolean) => setVisible(flag),
          onChangeIsEditor: (flag: boolean) => setIsEditor(flag),
          onChangeCurrentCluster: (cluster: ClusterType | undefined) => setCurrent(cluster),
        }}
      >
        <ClustersSearchBar />
        <ClustersTable />
      </ClustersPanelContext.Provider>
      <CreatedOrUpdatedClusterModal
        visible={visible}
        isEditor={isEditor}
        current={current}
        onCancel={() => {
          setVisible(false);
          setIsEditor(false);
          setCurrent(undefined);
        }}
      />
    </div>
  );
};
export default ClustersPanel;
