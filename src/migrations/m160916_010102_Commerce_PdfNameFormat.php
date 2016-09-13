<?php
namespace Craft;

class m160916_010102_Commerce_PdfNameFormat extends BaseMigration
{
	public function safeUp()
	{
		$settings = craft()->db->createCommand()->select('settings')->from('plugins')->where("class = :xclass", [':xclass' => 'Commerce'])->queryScalar();
		$settings = JsonHelper::decode($settings,true);
		$settings['orderPdfFileNameFormat'] = 'Order-{number}';
		$data = ['settings' => json_encode($settings)];
		craft()->db->createCommand()->update('plugins', $data, 'class = :xclass', [':xclass' => 'Commerce']);
	}
}
