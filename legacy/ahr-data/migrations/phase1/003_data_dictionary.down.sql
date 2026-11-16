-- DOWN for 003: removes exactly the 19 Phase-1 dictionary rows (by sheet name). Touches nothing else.
delete from public.data_dictionary where sheet in ('Work_Relationship','Ref_Relationship_Type');
