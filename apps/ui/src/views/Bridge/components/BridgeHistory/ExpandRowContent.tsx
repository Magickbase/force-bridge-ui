import { BridgeTransactionStatus } from '@force-bridge/commons/lib/types/apiv1';
import { Space } from 'antd';
import React from 'react';
import { RetryBurnButton } from './RetryBurnButton';
import { TransactionWithKey } from './index';
import { TransactionLink } from 'components/TransactionLink';

interface ExpandRowContentProps {
  record: TransactionWithKey;
}

export const ExpandRowContent: React.FC<ExpandRowContentProps> = (props) => {
  const { record } = props;
  const finalizeNumber = process.env.REACT_APP_FINALIZED_NUMBER;
  let confirmStatus;
  if (record.status === BridgeTransactionStatus.Successful) {
    confirmStatus = '';
  } else {
    confirmStatus =
      record.txSummary.fromTransaction.confirmStatus === 'confirmed' ||
      record.txSummary.fromTransaction.confirmStatus === 'pending'
        ? ` (${record.txSummary.fromTransaction.confirmStatus})`
        : ` (${record.txSummary.fromTransaction.confirmStatus.toString()}/${finalizeNumber})`;
  }
  const fromTransactionDescription =
    (record.txSummary.fromAsset.network === 'Nervos' ? '1. burn asset on ' : '1. lock asset on ') +
    record.txSummary.fromAsset.network +
    confirmStatus;

  let toTransactionDescription =
    (record.txSummary.toAsset.network === 'Nervos' ? '2. mint asset on ' : '2. unlock asset on ') +
    record.txSummary.toAsset.network;
  if (record.status === BridgeTransactionStatus.Failed) {
    toTransactionDescription = toTransactionDescription + ` (error: ${record.message})`;
  } else if (
    record.status === BridgeTransactionStatus.Pending &&
    record.txSummary.fromTransaction.confirmStatus === 'confirmed'
  ) {
    toTransactionDescription = toTransactionDescription + ' (pending)';
  }

  const isDisplayRetry =
    record.txSummary.fromTransaction.confirmStatus === 'pending' && record.txSummary.fromAsset.network === 'Nervos';
  const isDisplayToTransactionText =
    record.status === BridgeTransactionStatus.Failed ||
    (record.status === BridgeTransactionStatus.Pending &&
      record.txSummary.fromTransaction.confirmStatus === 'confirmed');

  return (
    <div>
      <div>
        <Space>
          <TransactionLink network={record.txSummary.fromAsset.network} txId={record.txSummary.fromTransaction.txId}>
            {fromTransactionDescription}
          </TransactionLink>
          {isDisplayRetry && <RetryBurnButton burnTxId={record.txSummary.fromTransaction.txId} />}
        </Space>
      </div>
      {isDisplayToTransactionText && <div>{toTransactionDescription}</div>}
      {record.status === BridgeTransactionStatus.Successful && record.txSummary?.toTransaction?.txId && (
        <div>
          <TransactionLink network={record.txSummary.toAsset.network} txId={record.txSummary.toTransaction.txId}>
            {toTransactionDescription}
          </TransactionLink>
        </div>
      )}
    </div>
  );
};
